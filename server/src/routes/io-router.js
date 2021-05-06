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

    socket.on("join", (callback=null) => {
      try {
        // Handle room logic
        socket.join(socket.handshake.session.room_num);
        socket.emit("message", {msg:`join room ${socket.handshake.session.room_num} success`});
        if (callback) callback();
        
      } catch (error) {
        console.error(error);
      } 
    });


    socket.on("draw", async ({ color }, callback) => {
      // Handle room logic
      let data = await client.get(`${redis_keys.ROOM_DATA}${socket.handshake.session.room_num}`);
      data = JSON.parse(data);
      let number = null;
      if(color === "w") {
        number = data.game.wArr.pop();
      }else{
        number = data.game.bArr.pop();
      }
      await client.set(
        `${redis_keys.ROOM_DATA}${socket.handshake.session.room_num}`, 
        JSON.stringify(data)
      );

      socket.emit("receiveCard", {number});
      callback();
    });

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

