const Player = require('../models/Player');
const Room = require('../models/Room');

module.exports = (io, socket, rooms) => {
    socket.on('join_room', ({ roomId, username }) => {
        let room = rooms.get(roomId);
        
        if (!room) {
            room = new Room(roomId);
            rooms.set(roomId, room);
        }

        try {
            const player = new Player(socket.id, username || `Player_${socket.id.substring(0,4)}`);
            room.addPlayer(player);
            
            socket.join(roomId);
            
            // Notifica la stanza dell'aggiornamento
            io.to(roomId).emit('room_state_update', {
                roomId: room.roomId,
                status: room.status,
                players: Array.from(room.players.values())
            });

            // Se la partita può iniziare, invia il segnale
            if (room.status === 'playing') {
                io.to(roomId).emit('game_start', { message: "Entrambi i giocatori connessi. Inizia la sfida!" });
            }

        } catch (error) {
            socket.emit('error', { message: error.message });
        }
    });
};