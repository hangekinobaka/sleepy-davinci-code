const {SESSION_LEAVE_COUNT_DOWN, ROOM_DATA_EXPIRE_TIME} = require("../variables/config");
const PromiseClient = require("../utils/redis");
const client = new PromiseClient();
const {redis_keys} = require("../variables/config");
const { GAME_STATUS, API_STATUS } = require("../variables/consts");
const { initData } = require("../utils/user");

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
        let user, opponent;
        if(data.user_1.session_id === _sessionId){
          user = 1;
          opponent = 2;
        }else{
          user = 2;
          opponent = 1;
        }

        let statusData = null;
        switch(data.status){
        case GAME_STATUS.USER_1_ANSWER:
        case GAME_STATUS.USER_2_ANSWER:
        case GAME_STATUS.USER_1_CHOOSE:
        case GAME_STATUS.USER_2_CHOOSE:
        case GAME_STATUS.USER_1_PUT_IN_LINE:
        case GAME_STATUS.USER_2_PUT_IN_LINE:
        case GAME_STATUS.USER_1_WIN:
        case GAME_STATUS.USER_2_WIN:
          statusData = data.game.guessing_card;
          break;
        default:
          break;
        }
        
        socket.emit("init", {
          wNum: data.game.wArr.length,
          bNum: data.game.bArr.length,
          line: data.game.lines[user],
          draggingLine: data.game.draggingLines[user],
          opLine: (data.game.lines[opponent]).map(card => ({
            color: card.color, 
            id: card.id, 
            revealed: card.revealed, 
            num: card.revealed ? card.num : null
          })),
          opDraggingLine: (data.game.draggingLines[opponent]).map(card => ({
            color: card.color, 
            id: card.id, 
            revealed: card.revealed, 
            num: card.revealed ? card.num : null
          })),
          score: data.score
        });

        io.to(_room).emit("usernames", {
          user_1: data.user_1.username,
          user_2: data.user_2.username
        });

        io.to(_room).emit("status", {
          status: data.status,
          statusData
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
       
        socket.broadcast.to(_room).emit("opReceiveCard", { 
          color
        });
        callback();
      }
      catch (error) {
        callback(error);
      }
    });

    socket.on("drawFinish", async ({ color, num, drawId }, callback) => {
      try {
        // Fetch data
        let data = await client.get(`${redis_keys.ROOM_DATA}${_room}`);
        data = JSON.parse(data);

        // See which user it is
        const user = data.user_1.session_id === _sessionId ? 1 : 2;

        // Push to the dragging line
        data.game.draggingLines[user].push({num, color, id: drawId});

        switch(data.status){
        case GAME_STATUS.USER_1_DRAW_INIT:
          if(data.game.draggingLines[2].length < 4) data.status = GAME_STATUS.USER_2_DRAW_INIT;
          else data.status = GAME_STATUS.PUT_IN_LINE_INIT;
          break;
        case GAME_STATUS.USER_2_DRAW_INIT:
          if(data.game.draggingLines[1].length < 4) data.status = GAME_STATUS.USER_1_DRAW_INIT;
          else data.status = GAME_STATUS.PUT_IN_LINE_INIT;
          break;
        case GAME_STATUS.USER_1_DRAW:
          data.status = GAME_STATUS.USER_1_GUESS;
          // reset the guessing card data
          data.game.guessing_card = {
            number: null, 
            index: null,
            isCorrect: null,
            opDraggingNum: null
          };

          break;
        case GAME_STATUS.USER_2_DRAW:
          data.status = GAME_STATUS.USER_2_GUESS;
          // reset the guessing card data
          data.game.guessing_card = {
            number: null, 
            index: null,
            isCorrect: null,
            opDraggingNum: null
          };
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
          status: data.status
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

        // Update status
        let status = data.status;
        switch(data.status){
        case GAME_STATUS.PUT_IN_LINE_INIT:
          if(data.game.draggingLines[opponent].length !== 0) break;
          else if(data.senTe === 1) status = GAME_STATUS.USER_1_DRAW;
          else if(data.senTe === 2) status = GAME_STATUS.USER_2_DRAG;
          break;
        case GAME_STATUS.USER_1_PUT_IN_LINE:
          status = GAME_STATUS.USER_2_DRAW;
          break;
        case GAME_STATUS.USER_2_PUT_IN_LINE:
          status = GAME_STATUS.USER_1_DRAW;
          break;
        default:
          break;
        }
        data.status = status;

        // Reset guessing card
        data.game.guessing_card = {
          number: null, 
          index: null,
          isCorrect: null,
          opDraggingNum: null
        };

        // Save data
        await client.set(
          `${redis_keys.ROOM_DATA}${_room}`, 
          JSON.stringify(data)
        );

        socket.emit("updateLineRes", {
          code: API_STATUS.API_CODE_SUCCESS
        });

        socket.broadcast.to(_room).emit("opUpdateLine", { 
          newLine: newLine.map(card => ({color: card.color, id: card.id}))
        });

        io.to(_room).emit("status", {
          status
        });
      }
      catch (error) {
        callback(error);

        socket.emit("updateLineRes", {
          code: API_STATUS.API_CODE_FAIL
        });
      }
    });
    
    socket.on("submitSelection", async ({ number, index }, callback) => {
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

        // Check if the guessing is correct
        const isCorrect = data.game.lines[opponent][index].num == number;

        data.game.guessing_card = {
          number, 
          index,
          isCorrect
        };

        // Set status
        data.status = user === 1 ? GAME_STATUS.USER_2_ANSWER : GAME_STATUS.USER_1_ANSWER;
        
        // Save data
        await client.set(
          `${redis_keys.ROOM_DATA}${_room}`, 
          JSON.stringify(data)
        );

        io.to(_room).emit("status", {
          status: data.status,
          statusData: data.game.guessing_card
        });
      }
      catch (error) {
        callback(error);
        socket.emit("submitSelectionRes", {
          code: API_STATUS.API_CODE_FAIL
        });
      }
    });

    socket.on("iSee", async (callback) => {
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

        // Set the corresponding card to revealed
        const guessing_card = data.game.guessing_card;
        if(guessing_card.isCorrect){
          data.game.lines[user][guessing_card.index].revealed = true;

          // Set status
          // First check if one of the user is win
          const userWin = !data.game.lines[user].find(card => card.revealed === false);
          if(userWin){
            // reset the guessing card data
            data.game.guessing_card = {
              number: null, 
              index: null,
              isCorrect: null,
              opDraggingNum: null
            };

            // Change sante
            data.sanTe = data.sanTe === 1 ? 2 : 1;

            if(user === 1){
              data.status = GAME_STATUS.USER_2_WIN;
              data.score[2] += 1;
            }else{
              data.status = GAME_STATUS.USER_1_WIN; 
              data.score[1] += 1;
            }
          }else{
            // If nobody wins, go to the CHOOSE status
            data.status = user === 1 ? GAME_STATUS.USER_2_CHOOSE : GAME_STATUS.USER_1_CHOOSE;
          }
        }else{
          data.game.guessing_card.opDraggingNum = data.game.draggingLines[opponent][0].num;

          // Set status
          data.status = user === 1 ? GAME_STATUS.USER_2_PUT_IN_LINE : GAME_STATUS.USER_1_PUT_IN_LINE;
        }
        
        
        // Save data
        await client.set(
          `${redis_keys.ROOM_DATA}${_room}`, 
          JSON.stringify(data)
        );

        io.to(_room).emit("status", {
          status: data.status,
          statusData:{
            ...data.game.guessing_card,
            score: data.score
          }
        });
      }
      catch (error) {
        callback(error);
      }
    });

    socket.on("continue", async ({isContinue}, callback) => {
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

        // set status
        if(isContinue){
          data.status = user === 1 ? GAME_STATUS.USER_1_GUESS : GAME_STATUS.USER_2_GUESS;
        }else{
          data.status = user === 1 ? GAME_STATUS.USER_1_PUT_IN_LINE : GAME_STATUS.USER_2_PUT_IN_LINE;
        }
        
        // Save data
        await client.set(
          `${redis_keys.ROOM_DATA}${_room}`, 
          JSON.stringify(data)
        );

        io.to(_room).emit("status", {
          status: data.status,
          statusData:data.game.guessing_card
        });
      }
      catch (error) {
        callback(error);
      }
    });

    socket.on("restart", async (callback) => {
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
        
        // Check if both users are ready to restart
        data.game.restart[user] = true;
        const restart = data.game.restart[1] && data.game.restart[2];

        // Set corresponding status
        if(restart){
          // init data
          data.game = initData();

          data.status = 0;
        }

        // Save data
        await client.set(
          `${redis_keys.ROOM_DATA}${_room}`, 
          JSON.stringify(data)
        );

        io.to(_room).emit("status", {
          status: data.status,
          statusData:data.game.guessing_card
        });
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

