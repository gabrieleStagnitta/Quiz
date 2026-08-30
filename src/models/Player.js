class Player {
    constructor(socketId, username) {
        this.socketId = socketId;
        this.username = username;
        this.isReady = false;
        this.score = 0;
        this.lastSubmittedCode = null;
    }

    resetForNewRound() {
        this.isReady = false;
        this.lastSubmittedCode = null;
    }
}

module.exports = Player;