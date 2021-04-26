const http = require("http");
const socketio = require("socket.io");
const express = require("express");

const expressInitializer = require("./initializers/express");
const ioInitializer = require("./initializers/io");
const {corsOption} = require("./variables/config");

const PORT = process.env.PORT || 8080;

const app = express();
const server = http.createServer(app);
const io = socketio(server, {
  cors: corsOption
});

// initialize aspects of the app
expressInitializer(app);
ioInitializer(io);

// Run when client connects
io.on("connection", socket => {
  console.log(`Socket ${socket.id} connected.`);
  console.log(socket.handshake.session);

  socket.on("join", ({ name, room }, callback) => {
    socket.join(room);
    socket.emit("message", { user: "admin", text: `${name}, welcome to room ${room}.`});
    callback();
  });

  socket.on("disconnect", () => {
    console.log(`Socket ${socket.id} disconnected.`);
  });
});

server.listen(PORT, () => {
  const port = server.address().port;
  console.log(`listening at port ${port}...`);
});
