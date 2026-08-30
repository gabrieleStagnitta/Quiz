const Room = require('../models/Room');
const registerRoomHandlers = require('./roomHandler');
const registerGameHandlers = require('./gameHandler');

// Stato in memoria delle stanze. 
// Per scalare orizzontalmente (multi-processo), questo andrà sostituito con Redis.
const rooms = new Map(); 

module.exports = (io) => {
    io.on('connection', (socket) => {
        console.log(`Nuova connessione: ${socket.id}`);

        // Passiamo socket, io e rooms agli handler specifici
        registerRoomHandlers(io, socket, rooms);
        registerGameHandlers(io, socket, rooms);

        socket.on('disconnect', () => {
            console.log(`Disconnesso: ${socket.id}`);
            // Logica di pulizia: trovare in che stanza era il giocatore e rimuoverlo
            for (const [roomId, room] of rooms.entries()) {
                if (room.players.has(socket.id)) {
                    room.removePlayer(socket.id);
                    io.to(roomId).emit('player_left', { socketId: socket.id });
                    if (room.players.size === 0) rooms.delete(roomId);
                    break;
                }
            }
        });
    });
};