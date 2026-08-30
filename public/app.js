// ==========================================
// 0. GESTIONE LOBBY E CONNESSIONE
// ==========================================
const socket = io(); 

const lobbyStatus = document.getElementById('lobby-status');
const btnP1 = document.getElementById('btn-p1');
const btnP2 = document.getElementById('btn-p2');
let mioRuolo = 0;
let workspace; // Dichiariamo workspace globale

// Il WebSocket si è aperto con successo!
socket.on('connect', () => {
    lobbyStatus.innerText = "Connesso! Scegli il tuo ruolo:";
    lobbyStatus.style.color = "#2ecc71";
    btnP1.style.display = 'inline-block';
    btnP2.style.display = 'inline-block';
});

// Inviamo al server la nostra scelta
function scegliRuolo(ruolo) {
    socket.emit('seleziona_ruolo', { ruolo: ruolo });
}

// Il server ci ha assegnato il ruolo. Entriamo in gioco!
socket.on('ruolo_confermato', (data) => {
    mioRuolo = data.ruolo;
    document.getElementById('lobbyArea').style.display = 'none';
    
    // Rendiamo visibile l'area di gioco
    document.getElementById('gameArea').style.display = 'flex';
    document.getElementById('blocklyContainer').style.display = 'block';

    // Disegniamo Blockly SOLO ORA che il contenitore è visibile!
    inizializzaBlocchi();
});

// Il ruolo è già stato preso dall'altro PC
socket.on('ruolo_occupato', () => {
    alert("Questo ruolo è già stato scelto! Seleziona l'altro.");
});

// L'avversario è entrato
socket.on('game_start', (data) => {
    console.log(data.message);
    const titoloAvversario = mioRuolo === 1 ? '#maze-p2 .maze-title' : '#maze-p1 .maze-title';
    document.querySelector(titoloAvversario).innerText += " - PRONTO! 🔥";
});

// Nuova logica per ricevere i codici (adattata al nuovo server)
socket.on('execute_code', (data) => {
    const mieMosse = mioRuolo === 1 ? (data.p1.percorso || []) : (data.p2.percorso || []);
    const mosseAvversario = mioRuolo === 1 ? (data.p2.percorso || []) : (data.p1.percorso || []);

    eseguiPercorsi(mieMosse, mosseAvversario);
});


// ==========================================
// 1 & 2. CARICAMENTO JSON E INIZIALIZZAZIONE
// ==========================================
async function inizializzaBlocchi() {
    try {
        const response = await fetch('commands.json');
        const configComandi = await response.json();

        const blocchiDivisiPerTipo = {};

        configComandi.forEach(comando => {
            const nomeBlocco = `azione_${comando.id}`;

            if (comando.tipo === 'movimento') {
                Blockly.Blocks[nomeBlocco] = {
                    init: function() {
                        this.jsonInit({
                            "message0": comando.testo,
                            "previousStatement": null,
                            "nextStatement": null,
                            "colour": comando.colore
                        });
                    }
                };
                javascript.javascriptGenerator.forBlock[nomeBlocco] = function() {
                    return `mosse.push('${comando.azione}');\n`;
                };

            } else if (comando.tipo === 'ciclo') {
                Blockly.Blocks[nomeBlocco] = {
                    init: function() {
                        this.jsonInit({
                            "message0": comando.testo + " %2 %3", 
                            "args0": [
                                { "type": "field_number", "name": "VOLTE", "value": 3, "min": 1, "max": 10 },
                                { "type": "input_dummy" },
                                { "type": "input_statement", "name": "CONTENUTO" }
                            ],
                            "previousStatement": null,
                            "nextStatement": null,
                            "colour": comando.colore
                        });
                    }
                };
                javascript.javascriptGenerator.forBlock[nomeBlocco] = function(block) {
                    const volte = block.getFieldValue('VOLTE');
                    const codiceInterno = javascript.javascriptGenerator.statementToCode(block, 'CONTENUTO');
                    return `for (let i = 0; i < ${volte}; i++) {\n${codiceInterno}}\n`;
                };
            }

            if (!blocchiDivisiPerTipo[comando.tipo]) {
                blocchiDivisiPerTipo[comando.tipo] = [];
            }
            blocchiDivisiPerTipo[comando.tipo].push({
                "kind": "block",
                "type": nomeBlocco
            });
        });

        const coloriCategorie = {
            "movimento": "#4C97FF", 
            "ciclo": "#0FBD8C"      
        };

        const categorieToolbox = [];
        for (const tipo in blocchiDivisiPerTipo) {
            const nomeMaiuscolo = tipo.charAt(0).toUpperCase() + tipo.slice(1);
            categorieToolbox.push({
                "kind": "category",
                "name": nomeMaiuscolo,
                "colour": coloriCategorie[tipo] || "#9966FF",
                "contents": blocchiDivisiPerTipo[tipo]
            });
        }

        const toolboxConfig = {
            "kind": "categoryToolbox",
            "contents": categorieToolbox
        };

        // Creiamo il workspace solo se non esiste già
        if (!workspace) {
            workspace = Blockly.inject('blocklyDiv', {
                toolbox: toolboxConfig,
                theme: Blockly.Themes.Zelos,
                renderer: 'zelos',
                trashcan: true
            });
        }

    } catch (error) {
        console.error("Errore fatale: Impossibile caricare commands.json", error);
    }
}


// ==========================================
// 3. MOTORE DI ESECUZIONE DELLA CORSA
// ==========================================
function eseguiPercorsi(mosseP1, mosseP2) {
    let step = 0;
    const LARGHEZZA_PASSO = 40; 
    
    let p1X = 20, p1Y = 60;
    let p2X = 20, p2Y = 60;

    const p1Avatar = document.getElementById('avatar-p1');
    const p2Avatar = document.getElementById('avatar-p2');

    const interval = setInterval(() => {
        let qualcunoSiE_Mosso = false;

        if (step < mosseP1.length) {
            const m = mosseP1[step];
            if (m === 'SU') p1Y -= LARGHEZZA_PASSO;
            if (m === 'GIU') p1Y += LARGHEZZA_PASSO;
            if (m === 'SINISTRA') p1X -= LARGHEZZA_PASSO;
            if (m === 'DESTRA') p1X += LARGHEZZA_PASSO;
            
            p1Avatar.style.left = p1X + 'px';
            p1Avatar.style.top = p1Y + 'px';
            qualcunoSiE_Mosso = true;
        }

        if (step < mosseP2.length) {
            const m = mosseP2[step];
            if (m === 'SU') p2Y -= LARGHEZZA_PASSO;
            if (m === 'GIU') p2Y += LARGHEZZA_PASSO;
            if (m === 'SINISTRA') p2X -= LARGHEZZA_PASSO;
            if (m === 'DESTRA') p2X += LARGHEZZA_PASSO;
            
            p2Avatar.style.left = p2X + 'px';
            p2Avatar.style.top = p2Y + 'px';
            qualcunoSiE_Mosso = true;
        }

        if (!qualcunoSiE_Mosso) {
            clearInterval(interval);
            setTimeout(() => alert("🏁 Corsa Terminata!"), 300);
        }
        
        step++;
    }, 500); 
}


// ==========================================
// 4. INVIO AL SERVER
// ==========================================
function inviaCodice() {
    if (!workspace) return;

    const codiceJsGenerato = javascript.javascriptGenerator.workspaceToCode(workspace);
    
    if (!codiceJsGenerato) {
        alert("Inserisci qualche blocco di movimento prima di partire!");
        return;
    }

    let mosse = []; 
    try {
        eval(codiceJsGenerato);
    } catch (error) {
        console.error("Errore durante l'elaborazione dei blocchi:", error);
    }
    
    socket.emit('submit_code', { 
        roomId: 'Sfida1', 
        blocks: { percorso: mosse } 
    });

    console.log("Hai bloccato la tua mossa. In attesa dell'avversario...");
}
