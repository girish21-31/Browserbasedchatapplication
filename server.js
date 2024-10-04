const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

const users = new Map();

io.on('connection', (socket) => {
    console.log('New user connected');

    socket.on('join', (username) => {
        users.set(socket.id, username);
        io.emit('userJoined', username);
        io.emit('userList', Array.from(users.values()));
    });

    socket.on('chatMessage', (message) => {
        const username = users.get(socket.id);
        io.emit('message', {
            username,
            text: message,
            timestamp: new Date().getTime()
        });
    });

    socket.on('typing', () => {
        const username = users.get(socket.id);
        socket.broadcast.emit('userTyping', username);
    });

    socket.on('disconnect', () => {
        const username = users.get(socket.id);
        users.delete(socket.id);
        io.emit('userLeft', username);
        io.emit('userList', Array.from(users.values()));
        console.log('User disconnected');
    });
});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));