module.exports = (io, socket, rooms) => {
    socket.on('submit_code', ({ roomId, blocks }) => {
        const room = rooms.get(roomId);
        if (!room || room.status !== 'playing') return;

        // Salva il codice inviato dal giocatore
        room.submitCode(socket.id, blocks);
        
        // Avvisa l'avversario che questo giocatore è pronto
        socket.to(roomId).emit('opponent_ready');

        // Controlla se entrambi hanno inviato il codice
        if (room.areBothPlayersReady()) {
            room.status = 'evaluating';
            
            // Qui inseriresti un motore che valuta i "blocchi" di codice.
            // Per ora, emettiamo un evento che fa scattare l'animazione sul frontend.
            io.to(roomId).emit('execute_code', {
                playersData: Array.from(room.players.values())
            });

            // Reset per il round successivo
            for (const player of room.players.values()) {
                player.resetForNewRound();
            }
            room.status = 'playing';
        }
    });
};