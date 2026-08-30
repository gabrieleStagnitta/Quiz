// Variabili per tenere traccia di chi ha preso quale ruolo
let p1SocketId = null;
let p2SocketId = null;

// Salveremo qui il codice in attesa di essere eseguito
const codicePronto = {};

module.exports = function(io) {
    io.on('connection', (socket) => {
        console.log('Nuova connessione rilevata:', socket.id);

        // 1. Un giocatore prova a scegliere un ruolo
        socket.on('seleziona_ruolo', (data) => {
            if (data.ruolo === 1) {
                if (!p1SocketId) {
                    p1SocketId = socket.id;
                    socket.join('Sfida1');
                    socket.emit('ruolo_confermato', { ruolo: 1 });
                } else {
                    socket.emit('ruolo_occupato');
                }
            } else if (data.ruolo === 2) {
                if (!p2SocketId) {
                    p2SocketId = socket.id;
                    socket.join('Sfida1');
                    socket.emit('ruolo_confermato', { ruolo: 2 });
                } else {
                    socket.emit('ruolo_occupato');
                }
            }

            // Se entrambi sono connessi, avvisa la stanza
            if (p1SocketId && p2SocketId) {
                io.to('Sfida1').emit('game_start', { message: 'Entrambi i giocatori sono pronti!' });
            }
        });

        // 2. Ricezione del codice a blocchi
        socket.on('submit_code', (data) => {
            codicePronto[socket.id] = data.blocks;
            
            // Avvisiamo l'avversario
            socket.to(data.roomId).emit('opponent_ready');

            // Se abbiamo ricevuto il codice da entrambi, eseguiamo!
            if (codicePronto[p1SocketId] && codicePronto[p2SocketId]) {
                io.to(data.roomId).emit('execute_code', {
                    p1: codicePronto[p1SocketId],
                    p2: codicePronto[p2SocketId]
                });
                
                // Resettiamo per la prossima corsa
                delete codicePronto[p1SocketId];
                delete codicePronto[p2SocketId];
            }
        });

        // 3. Gestione disconnessione
        socket.on('disconnect', () => {
            if (socket.id === p1SocketId) p1SocketId = null;
            if (socket.id === p2SocketId) p2SocketId = null;
            console.log('Giocatore disconnesso:', socket.id);
        });
    });
};
