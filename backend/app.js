const express = require("express");
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const PORT = 80;
const app = express();
app.use(cors());
const server = http.createServer(app);
const io = socketIo(server);

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

io.on('connection', (socket) => {
    console.log('A new client connected: ' + socket.id);
    socket.on('sendToMe', (data) => {
        console.log('Received data from client:', data);
        socket.emit('message', 'This is a message just for you!');
    });
});