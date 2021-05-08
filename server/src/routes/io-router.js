const {SESSION_LEAVE_COUNT_DOWN, ROOM_DATA_EXPIRE_TIME} = require("../variables/config");
const PromiseClient = require("../utils/redis");
const client = new PromiseClient();
const {redis_keys} = require("../variables/config");
const { GAME_STATUS, API_STATUS } = require("../variables/consts");

module.exports = function(io){
  // Run when client connects
  io.on("connection", async socket => {
    const _room = socket.handshake.session.room_num;
    const _sessionId = socket.handshake.sessionID;

    // Handle room logic
    socket.join(_room);

    await client.pexpire(
      `${redis_keys.ROOM_DATA}${_room}`, 
      ROOM_DATA_EXPIRE_TIME * 1000
    );

    socket.on("join", async (callback) => {
      try {
        // Fetch data
        let data = await client.get(`${redis_keys.ROOM_DATA}${_room}`);
        data = JSON.parse(data);

        // See which user it is
        const user = data.user_1.session_id === _sessionId ? 1 : 2;
        
        socket.emit("init", {
          wNum: data.game.wArr.length,
          bNum: data.game.bArr.length,
          line: data.game.lines[user],
          drawingLine: data.game.draggingLines[user]
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

        // Draw a number
        let number = null;
        if(color === "w") {
          number = data.game.wArr.pop();
        }else{
          number = data.game.bArr.pop();
        }

        socket.emit("receiveCard", { num:number });

        io.to(_room).emit("cardNumChange", {
          wNum: data.game.wArr.length,
          bNum: data.game.bArr.length,
        });
       
        callback();
      }
      catch (error) {
        callback(error);
      }
    });

    socket.on("drawFinish", async ({ color, num }, callback) => {
      try {
        // Fetch data
        let data = await client.get(`${redis_keys.ROOM_DATA}${_room}`);
        data = JSON.parse(data);

        // See which user it is
        const user = data.user_1.session_id === _sessionId ? 1 : 2;

        // Push to the dragging line
        data.game.draggingLines[user].push({num, color});

        switch(data.game.status){
        case GAME_STATUS.USER_1_DRAW_INIT:
          if(data.game.draggingLines[2].length < 4) data.game.status = GAME_STATUS.USER_2_DRAW_INIT;
          else data.game.status = GAME_STATUS.PUT_IN_LINE_INIT;
          break;
        case GAME_STATUS.USER_2_DRAW_INIT:
          if(data.game.draggingLines[1].length < 4) data.game.status = GAME_STATUS.USER_1_DRAW_INIT;
          else data.game.status = GAME_STATUS.PUT_IN_LINE_INIT;
          break;
        default:
          break;
        }

        // Remove the corresponding element
        if(color === "w") {
          data.game.wArr.pop();
        }else{
          data.game.bArr.pop();
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
        // Fetch data
        let data = await client.get(`${redis_keys.ROOM_DATA}${_room}`);
        data = JSON.parse(data);
        
        // See which user it is
        let user, opponent;
        if(data.user_1.session_id === _sessionId){
          user = 1;
          opponent = 2;
        }else{
          user = 2;
          opponent = 1;
        }
        
        // Exit if there is no change
        if(data.game.lines[user].length === newLine.length) return;
        
        // Update user line
        data.game.lines[user] = newLine;
        data.game.draggingLines[user] = [];

        let status = data.game.status;
        switch(data.game.status){
        case GAME_STATUS.PUT_IN_LINE_INIT:
          if(data.game.draggingLines[opponent].length !== 0) break;
          else if(data.game.senTe === 1) status = GAME_STATUS.USER_1_GUESS_MUST;
          else if(data.game.senTe === 2) status = GAME_STATUS.USER_2_GUESS_MUST;
          break;
        default:
          break;
        }

        data.game.status = status;

        // Save data
        await client.set(
          `${redis_keys.ROOM_DATA}${_room}`, 
          JSON.stringify(data)
        );

        socket.emit("updateLineRes", {
          res: API_STATUS.API_CODE_SUCCESS
        });

        io.to(_room).emit("status", {
          status
        });
      }
      catch (error) {
        callback(error);

        socket.emit("updateLineRes", {
          res: API_STATUS.API_CODE_FAIL
        });
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

