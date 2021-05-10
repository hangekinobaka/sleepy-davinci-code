const PromiseClient = require("../utils/redis");
const client = new PromiseClient();
const { roomCodeGenerator, initData } = require("../utils/user");
const {redis_keys, ROOM_DATA_EXPIRE_TIME} = require("../variables/config");
const { GAME_STATUS, API_STATUS } = require("../variables/consts");

const init = async (req, res)=>{
  try {
    if(req.session.room_num){
      // Get the room data
      let room_data = await client.get(`${redis_keys.ROOM_DATA}${req.session.room_num}`);
      if(room_data === null) {
        req.session.destroy();
        res.status(200).json({code: API_STATUS.API_CODE_ROOM_DESTROYED, msg:"room is not exist"}); 
        return;
      }
      // If there is room data, send the needed information
      room_data = JSON.parse(room_data);
      res.status(200).json({code: API_STATUS.API_CODE_SUCCESS, data:{
        ...room_data,
        user_num: req.sessionID === room_data.user_1.session_id ? 1 : 2
      }, msg:"resume game"});
    }else{
      req.session.destroy();
      res.status(200).json({code: API_STATUS.API_CODE_NO_DATA, msg:"no previous data"});
    }
  } catch (error) {
    req.session.destroy();
    res.status(403).json({code: API_STATUS.API_CODE_FAIL, msg:"init failed", error});
  }
};

const login = async (req, res)=>{
  /**
   * TODO: implement validation using `joi`
   */
  try {
    const { username, isPrivate } = req.body;

    // Generate and save room code
    const room = await roomCodeGenerator(client);
    if(room === null) { res.status(200).json({code: API_STATUS.API_CODE_ROOM_GEN_FAIL, msg:"room generate failed"}); return;}

    // Generate game data
    const data = initData();

    // Store room number in `room_data` and `session`
    await client.setex(
      `${redis_keys.ROOM_DATA}${room.room_num}`, 
      ROOM_DATA_EXPIRE_TIME,
      JSON.stringify({
        room_num: room.room_num,
        room_code: room.room_code,
        is_public: isPrivate,
        game:data,
        user_1:{
          session_id: req.sessionID,
          username
        }
      })
    );

    // Store the room number to the public room queue
    if(!isPrivate){
      await client.lpush(
        redis_keys.PUBLIC_QUEUE,
        room.room_num
      );
    }

    // Store the session data
    req.session.room_num = room.room_num;
    
    res.status(200).json({code: API_STATUS.API_CODE_SUCCESS, msg:"login success"});
  } catch (error) {
    
    req.session.destroy();
    res.status(200).json({code: API_STATUS.API_CODE_FAIL, msg:"login failed", error});
  }
};

const exit = async (req, res)=>{
  try {
    // Remove redis records
    const room_num = req.session.room_num;
    await client.del(`${redis_keys.ROOM_DATA}${room_num}`);
    
    // Remove session
    req.session.destroy();
    
    res.status(200).json({code: API_STATUS.API_CODE_SUCCESS, msg:"exit success"});
  } catch (error) {
    res.status(200).json({code: API_STATUS.API_CODE_FAIL, msg:"exit failed", error});
  }
};

const join = async (req, res)=>{
  try {
    const { username, inviteCode } = req.body;
    let room_num,room_data;
    // If has no invite room code, pick up a room from the public room queue
    if(inviteCode === ""){
      do{
      // check if list exist
        const list_len = await client.llen(redis_keys.PUBLIC_QUEUE);
        // If there is no room left, tell user to create a room instead
        if(list_len == 0) {res.status(200).json({code: API_STATUS.API_CODE_NO_ROOM, msg:"no room to join"}); return;}
        // Pop the room out and see if it is still valid, if not, repeat the pop
        let data = await client.brpop(redis_keys.PUBLIC_QUEUE, 0);
        room_num = parseInt(data[1]);
        room_data = await client.get(`${redis_keys.ROOM_DATA}${room_num}`);
      }while(room_data === null);
    }else{
      // If has a invite room code, find the room 
      room_num = parseInt(inviteCode);
      room_data = await client.get(`${redis_keys.ROOM_DATA}${room_num}`);
      if(room_data === null) {res.status(200).json({code: API_STATUS.API_CODE_NO_ROOM, msg:"no room to join"}); return;}
    }
    // save the user 2 to the room
    room_data = JSON.parse(room_data);
    room_data.game.status = GAME_STATUS.USER_1_DRAW_INIT;
    // If for some reason the room is already taken, return a msg
    if("user_2" in room_data) {res.status(200).json({code: API_STATUS.API_CODE_ROOM_TAKEN, msg:"the room is taken"}); return;}
    await client.setex(
      `${redis_keys.ROOM_DATA}${room_num}`, 
      ROOM_DATA_EXPIRE_TIME,
      JSON.stringify({
        ...room_data,
        user_2:{
          session_id: req.sessionID,
          username
        },
      })
    );

    // save back to the session
    req.session.room_num = room_num;
    res.status(200).json({code: API_STATUS.API_CODE_SUCCESS, msg:"join success"});
  }catch(error){
    res.status(200).json({code: API_STATUS.API_CODE_FAIL, msg:"join failed", error});
  }
};

module.exports = {
  login,
  exit,
  init,
  join
};