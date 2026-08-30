const express = require('express');
const path = require('path'); 
const app = express();
const http = require('http');
const { Server } = require('socket.io');
const setupSockets = require('./src/sockets');

// 1. Modifica applicata qui: path.join assicura che trovi sempre la cartella
app.use(express.static(path.join(__dirname, 'public')));

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*", 
        methods: ["GET", "POST"]
    }
});

setupSockets(io);

// Porta dinamica assegnata da Render
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log('Server online!'));
