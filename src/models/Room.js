class Room {
    constructor(roomId) {
        this.roomId = roomId;
        this.players = new Map(); // socketId -> Player
        this.status = 'waiting'; // waiting, playing, evaluating, finished
    }

    addPlayer(player) {
        if (this.players.size >= 2) throw new Error("Stanza piena");
        this.players.set(player.socketId, player);
        if (this.players.size === 2) this.status = 'playing';
    }

    removePlayer(socketId) {
        this.players.delete(socketId);
        this.status = 'waiting';
    }

    submitCode(socketId, blocks) {
        const player = this.players.get(socketId);
        if (player) {
            player.lastSubmittedCode = blocks;
            player.isReady = true;
        }
    }

    areBothPlayersReady() {
        if (this.players.size < 2) return false;
        let readyCount = 0;
        for (const player of this.players.values()) {
            if (player.isReady) readyCount++;
        }
        return readyCount === 2;
    }
}

module.exports = Room;