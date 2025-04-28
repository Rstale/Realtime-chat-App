const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

app.use(cors());

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

let usersTyping = new Set();

io.on('connection', (socket) => {
  console.log('🟢 User connected:', socket.id);

  socket.on('send_message', (data) => {
    console.log('💬 Message received:', data);
    io.emit('receive_message', data);

    setTimeout(() => {
      usersTyping.add('Auto Reply');
      io.emit('typing', Array.from(usersTyping));

      setTimeout(() => {
        const replyMessage = {
          username: 'Auto Reply',
          message: 'Hello Abhishek Patil',
          timestamp: new Date().toLocaleTimeString(),
        };
        io.emit('receive_message', replyMessage);

        usersTyping.delete('Auto Reply');
        io.emit('typing', Array.from(usersTyping));
      }, 1000);
    }, 3000);
  });

  socket.on('typing', (data) => {
    console.log(`${data.username} is typing...`);
    socket.username = data.username;
    usersTyping.add(data.username);
    socket.broadcast.emit('typing', Array.from(usersTyping));
  });

  socket.on('stop_typing', (data) => {
    console.log(`${data.username} stopped typing...`);
    usersTyping.delete(data.username);
    socket.broadcast.emit('typing', Array.from(usersTyping));
  });

  socket.on('disconnect', () => {
    console.log('🔴 User disconnected:', socket.id);
    if (socket.username) {
      usersTyping.delete(socket.username);
      socket.broadcast.emit('typing', Array.from(usersTyping));
    }
  });
});

server.listen(3001, () => {
  console.log('✅ Backend running at http://localhost:3001');
});