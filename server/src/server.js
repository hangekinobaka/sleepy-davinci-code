const http = require('http')
const socketio = require('socket.io')
const express = require('express')
const redis = require("redis");
const cors = require('cors');

const router = require('./router');

const PORT = process.env.PORT || 8080;
const CLIENT_PORT = process.env.CLIENT_PORT || 3000;
const ORIGIN = process.env.ORIGIN || 'http://localhost';
const REDIS_PORT = process.env.REDIS_PORT || 6379;
const REDIS_HOST = process.env.REDIS_HOST || '127.0.0.1';

const app = express();
app.use(router)
app.use(cors())

const server = http.createServer(app)

const io = socketio(server, {
  cors: {
    origin: `${ORIGIN}:${CLIENT_PORT}`,
    credentials: true
  }
});

const client = redis.createClient(REDIS_PORT, REDIS_HOST);

// Run when client connects
io.on('connection', socket => {
  console.log(`Socket ${socket.id} connected.`);

  socket.on('disconnect', () => {
    console.log(`Socket ${socket.id} disconnected.`);
  });
})

server.listen(PORT, () => {
  const port = server.address().port
  console.log(`listening at port ${port}...`)
});
