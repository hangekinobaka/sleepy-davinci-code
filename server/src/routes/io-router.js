const {SESSION_LEAVE_COUNT_DOWN, ROOM_DATA_EXPIRE_TIME} = require("../variables/config");
const PromiseClient = require("../utils/redis");
const client = new PromiseClient();
const {redis_keys} = require("../variables/config");
const { GAME_STATUS } = require("../variables/consts");

module.exports = function(io){
  // Run when client connects
  io.on("connection", async socket => {
    const _room = socket.handshake.session.room_num;
    const _sessionId = socket.handshake.sessionID;

    await client.pexpire(
      `${redis_keys.ROOM_DATA}${_room}`, 
      ROOM_DATA_EXPIRE_TIME * 1000
    );

    socket.on("join", async (callback) => {
      try {
        // Handle room logic
        socket.join(_room);

        // Fetch data
        let data = await client.get(`${redis_keys.ROOM_DATA}${_room}`);
        data = JSON.parse(data);

        // See which user it is
        const user = data.user_1.session_id === _sessionId ? 1 : 2;
        
        socket.emit("init", {
          wNum: data.game.wArr.length,
          bNum: data.game.bArr.length,
          line: data.game.lines[user]
        });

        io.to(_room).emit("status", {
          status: data.game.status
        });

        if (callback) callback();
        
      } catch (error) {
        console.error(error);
      } 
    });

    socket.on("draw", async ({ color }, callback) => {
      try {
        // Fetch data
        let data = await client.get(`${redis_keys.ROOM_DATA}${_room}`);
        data = JSON.parse(data);

        // See which user it is
        const user = data.user_1.session_id === _sessionId ? 1 : 2;
        
        // Draw a number
        let number = null;
        if(color === "w") {
          number = data.game.wArr.pop();
        }else{
          number = data.game.bArr.pop();
        }

        // Push to the dragging line
        data.game.darggingLines[user].push({num: number, color});

        // Save data
        await client.set(
          `${redis_keys.ROOM_DATA}${_room}`, 
          JSON.stringify(data)
        );

        socket.emit("receiveCard", {number});
        callback();
      }
      catch (error) {
        callback(error);
      }
    });

    socket.on("drawFinish", async (callback) => {
      try {
        // Fetch data
        let data = await client.get(`${redis_keys.ROOM_DATA}${_room}`);
        data = JSON.parse(data);

        switch(data.game.status){
        case GAME_STATUS.USER_1_DRAW_INIT:
          if(data.game.darggingLines[2].length < 4) data.game.status = GAME_STATUS.USER_2_DRAW_INIT;
          else data.game.status = GAME_STATUS.USER_1_GUESS_MUST;
          break;
        case GAME_STATUS.USER_2_DRAW_INIT:
          if(data.game.darggingLines[1].length < 4) data.game.status = GAME_STATUS.USER_1_DRAW_INIT;
          else data.game.status = GAME_STATUS.USER_2_GUESS_MUST;
          break;
        default:
          break;
        }

        // Save data
        await client.set(
          `${redis_keys.ROOM_DATA}${_room}`, 
          JSON.stringify(data)
        );

        io.to(_room).emit("status", {
          status: data.game.status
        });
      }
      catch (error) {
        callback(error);
      }
    });

    socket.on("updateLine", async ({ newLine }, callback) => {
      try {
        let data = await client.get(`${redis_keys.ROOM_DATA}${_room}`);
        data = JSON.parse(data);
        // See which user it is
        const user = data.user_1.session_id === _sessionId ? 1 : 2;
        if(data.game.lines[user].length === newLine.length) return;
        // Update user line
        data.game.lines[user] = newLine;
        await client.set(
          `${redis_keys.ROOM_DATA}${_room}`, 
          JSON.stringify(data)
        );
      }
      catch (error) {
        callback(error);
      }
    });

    socket.on("disconnect", async () => {
      // Tell the oponent I have left
      io.to(_room).emit("status", {
        status: GAME_STATUS.USER_LEFT
      });
      // IF the user leave, give it a count down  
      await client.pexpire(`sess:${_sessionId}`, SESSION_LEAVE_COUNT_DOWN);
      await client.pexpire(
        `${redis_keys.ROOM_DATA}${_room}`, 
        SESSION_LEAVE_COUNT_DOWN
      );
    });

    socket.on("exit", async () => {
      // Tell the oponent I have exited
      io.to(_room).emit("status", {
        status: GAME_STATUS.USER_EXIT
      });
    });
  });
};

