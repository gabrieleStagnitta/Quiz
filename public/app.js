// ==========================================
// 0. GESTIONE LOBBY E CONNESSIONE
// ==========================================
const socket = io(); // Si connette automaticamente al server giusto (locale o cloud)

const lobbyStatus = document.getElementById('lobby-status');
const btnP1 = document.getElementById('btn-p1');
const btnP2 = document.getElementById('btn-p2');
let mioRuolo = 0;

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
    
    // Mostriamo la grafica del gioco
    document.getElementById('gameArea').style.display = 'flex';
    document.getElementById('blocklyContainer').style.display = 'block';

    // Disegniamo Blockly (la funzione che avevi già scritto)
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
    // Selezioniamo le mosse in base al nostro ruolo per centrare l'animazione
    const mieMosse = mioRuolo === 1 ? (data.p1.percorso || []) : (data.p2.percorso || []);
    const mosseAvversario = mioRuolo === 1 ? (data.p2.percorso || []) : (data.p1.percorso || []);

    eseguiPercorsi(mieMosse, mosseAvversario);
});
