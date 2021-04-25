const http = require("http");
const socketio = require("socket.io");
const express = require("express");
const cookieParser = require("cookie-parser");

const {corsOption,SESSION_SECRET} = require("./utils/config");
const router = require("./router");
const session = require("./middleware/session");

const PORT = process.env.PORT || 8080;

const app = express();
app.use(cookieParser(SESSION_SECRET));

// if you run behind a proxy (e.g. nginx)
// app.set('trust proxy', 1);

// To process the req body
app.use(express.json());
app.use(session);
app.use(router);

const server = http.createServer(app);
const io = socketio(server, {cors: corsOption});

// Run when client connects
io.on("connection", socket => {
  console.log(`Socket ${socket.id} connected.`);

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
