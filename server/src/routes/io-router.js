const {SESSION_LEAVE_COUNT_DOWN, ROOM_DATA_EXPIRE_TIME} = require("../variables/config");
const PromiseClient = require("../utils/redis");
const client = new PromiseClient();
const {redis_keys} = require("../variables/config");


module.exports = function(io){
  // Run when client connects
  io.on("connection", async socket => {
    console.log(`Socket ${socket.id} connected.`);
    await client.pexpire(
      `${redis_keys.ROOM_DATA}${socket.handshake.session.room_num}`, 
      ROOM_DATA_EXPIRE_TIME * 1000
    );

    socket.on("join", ({ username, room }, callback) => {
      // Handle room logic
      socket.join(room);
      socket.emit("message", {msg:"join success"});
      callback();
    });


    // socket.on("join", ({ username, room }, callback) => {
    //   // Handle room logic
    //   socket.join(room);
    //   socket.emit("message", { user: "admin", text: `${username}, welcome to room ${room}.`});
    //   callback();
    // });

    socket.on("disconnect", async () => {
      // IF the user leave, give it a count down  
      const session_id = socket.handshake.sessionID;
      await client.pexpire(`sess:${session_id}`, SESSION_LEAVE_COUNT_DOWN);
      await client.pexpire(
        `${redis_keys.ROOM_DATA}${socket.handshake.session.room_num}`, 
        SESSION_LEAVE_COUNT_DOWN
      );
      
      console.log(`Socket ${socket.id} disconnected.`);
    });
  });
};

