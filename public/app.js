// ==========================================
// 0. CONNESSIONE AL SERVER MULTIPLAYER
// ==========================================
const socket = io();

socket.emit('join_room', { 
    roomId: 'Sfida1', 
    username: 'Giocatore_' + Math.floor(Math.random() * 1000) 
});

socket.on('game_start', (data) => {
    console.log(data.message);
    document.querySelector('#maze-p2 .maze-title').innerText = "AVVERSARIO REALE 👾";
});

socket.on('opponent_ready', () => {
    console.log("L'avversario ha inviato la sua mossa! Sbrigati!");
});

socket.on('execute_code', (data) => {
    const ioStesso = data.playersData.find(p => p.socketId === socket.id);
    const avversario = data.playersData.find(p => p.socketId !== socket.id);

    const mieMosse = ioStesso.lastSubmittedCode.percorso || [];
    const mosseAvversario = avversario.lastSubmittedCode.percorso || [];

    eseguiPercorsi(mieMosse, mosseAvversario);
});


// ==========================================
// 1 & 2. CARICAMENTO JSON E INIZIALIZZAZIONE
// ==========================================
let workspace; 

async function inizializzaBlocchi() {
    try {
        const response = await fetch('commands.json');
        const configComandi = await response.json();

        // 1. Creiamo un oggetto vuoto che farà da "raccoglitore" diviso per tipi
        const blocchiDivisiPerTipo = {};

        configComandi.forEach(comando => {
            const nomeBlocco = `azione_${comando.id}`;

            // --- INIZIO CREAZIONE BLOCCHI ---
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
            // --- FINE CREAZIONE BLOCCHI ---

            // 2. Se la categoria (es. 'movimento') non esiste ancora nel raccoglitore, la creiamo
            if (!blocchiDivisiPerTipo[comando.tipo]) {
                blocchiDivisiPerTipo[comando.tipo] = [];
            }

            // 3. Inseriamo il blocco appena creato nella sua categoria di appartenenza
            blocchiDivisiPerTipo[comando.tipo].push({
                "kind": "block",
                "type": nomeBlocco
            });
        });

        // 4. Mappiamo i colori delle categorie per l'estetica del menu laterale
        const coloriCategorie = {
            "movimento": "#4C97FF", // Blu
            "ciclo": "#0FBD8C"      // Verde
            // Se in futuro aggiungi "azione" nel JSON, aggiungi qui il suo colore!
        };

        const categorieToolbox = [];

        // 5. Costruiamo dinamicamente il menu scorrendo i contenitori che abbiamo riempito
        for (const tipo in blocchiDivisiPerTipo) {
            // Capitalizza la prima lettera (es. "movimento" -> "Movimento")
            const nomeMaiuscolo = tipo.charAt(0).toUpperCase() + tipo.slice(1);

            categorieToolbox.push({
                "kind": "category",
                "name": nomeMaiuscolo,
                "colour": coloriCategorie[tipo] || "#9966FF", // Colore di default se non mappato
                "contents": blocchiDivisiPerTipo[tipo]
            });
        }

        // 6. Iniezione finale con la toolbox multi-categoria
        const toolboxConfig = {
            "kind": "categoryToolbox",
            "contents": categorieToolbox
        };

        workspace = Blockly.inject('blocklyDiv', {
            toolbox: toolboxConfig,
            theme: Blockly.Themes.Zelos,
            renderer: 'zelos',
            trashcan: true
        });

    } catch (error) {
        console.error("Errore fatale: Impossibile caricare commands.json", error);
    }
}

inizializzaBlocchi();

// ==========================================
// 3. MOTORE DI ESECUZIONE DELLA CORSA
// ==========================================
function eseguiPercorsi(mosseP1, mosseP2) {
    let step = 0;
    const LARGHEZZA_PASSO = 40; 
    
    // Coordinate iniziali
    let p1X = 20, p1Y = 60;
    let p2X = 20, p2Y = 60;

    const p1Avatar = document.getElementById('avatar-p1');
    const p2Avatar = document.getElementById('avatar-p2');

    const interval = setInterval(() => {
        let qualcunoSiE_Mosso = false;

        // Muovi Giocatore 1 (Tu)
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

        // Muovi Avversario (L'altra pagina web)
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
    
    // Invece di far partire subito l'animazione, inviamo il nostro percorso al server
    socket.emit('submit_code', { 
        roomId: 'Sfida1', 
        blocks: { percorso: mosse } 
    });

    console.log("Hai bloccato la tua mossa. In attesa dell'avversario...");
}