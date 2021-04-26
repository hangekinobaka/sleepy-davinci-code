const {SESSION_LEAVE_COUNT_DOWN} = require("../variables/config");
const PromiseClient = require("../utils/redis");
const client = new PromiseClient();

module.exports = function(io){
  // Run when client connects
  io.on("connection", socket => {
    console.log(`Socket ${socket.id} connected.`);

    socket.on("join", ({ name, room }, callback) => {
      // Handle room logic
      socket.join(room);
      socket.emit("message", { user: "admin", text: `${name}, welcome to room ${room}.`});
      callback();
    });

    socket.on("disconnect", async () => {
      // IF the user leave, give it a count down  
      const session_id = socket.handshake.sessionID;
      await client.pexpire(`sess:${session_id}`, SESSION_LEAVE_COUNT_DOWN);
      
      console.log(`Socket ${socket.id} disconnected.`);
    });
  });
};

