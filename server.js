const express = require('express');
const app = express();
const http = require('http');
const { Server } = require('socket.io');
const setupSockets = require('./src/sockets');

// Carica l'interfaccia grafica
app.use(express.static('public'));

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