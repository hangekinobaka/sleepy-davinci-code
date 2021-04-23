const http = require("http");
const socketio = require("socket.io");
const express = require("express");
const redis = require("redis");

const {corsOption} = require("./configs/options");
const router = require("./router");

const PORT = process.env.PORT || 8080;
const REDIS_PORT = process.env.REDIS_PORT || 6379;
const REDIS_HOST = process.env.REDIS_HOST || "127.0.0.1";

const app = express();
app.use(router);

const server = http.createServer(app);

const io = socketio(server, {cors: corsOption});

const client = redis.createClient(REDIS_PORT, REDIS_HOST);

// Run when client connects
io.on("connection", socket => {
  console.log(`Socket ${socket.id} connected.`);

  socket.on("disconnect", () => {
    console.log(`Socket ${socket.id} disconnected.`);
  });
});

server.listen(PORT, () => {
  const port = server.address().port;
  console.log(`listening at port ${port}...`);
});
