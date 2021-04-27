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

server.listen(PORT, () => {
  const port = server.address().port;
  console.log(`listening at port ${port}...`);
});
