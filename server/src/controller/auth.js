const PromiseClient = require("../utils/redis");
const client = new PromiseClient();
const { roomCodeGenerator } = require("../utils/user");
const {redis_keys, ROOM_DATA_EXPIRE_TIME} = require("../variables/config");

const init = (req, res)=>{
  try {
    if(req.session.room_num){
      res.status(200).json({code: 1, msg:"resume game"});
    }else{
      res.status(200).json({code: 2, msg:"no previous data"});
    }
  } catch (error) {
    req.session.destroy();
    res.status(403).json({code: 0, msg:"init failed", error});
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
    if(room === null) { res.status(200).json({code: 3, msg:"room generate failed"}); return;}

    // Store room number in `room_data` and `session`
    await client.setex(
      `${redis_keys.ROOM_DATA}${room.room_num}`, 
      ROOM_DATA_EXPIRE_TIME,
      JSON.stringify({
        room_code: room.room_code,
        is_public: isPrivate,
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
    
    res.status(200).json({code: 1, msg:"login success"});
  } catch (error) {
    
    req.session.destroy();
    res.status(200).json({code: 0, msg:"login failed", error});
  }
};

const exit = async (req, res)=>{
  try {
    // Remove redis records
    const room_num = req.session.room_num;
    await client.del(`${redis_keys.ROOM_DATA}${room_num}`);
    
    // Remove session
    req.session.destroy();
    
    res.status(200).json({code: 1, msg:"exit success"});
  } catch (error) {
    res.status(200).json({code: 0, msg:"exit failed", error});
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
        if(list_len == 0) {res.status(200).json({code: 4, msg:"no room to join"}); return;}
        // Pop the room out and see if it is still valid, if not, repeat the pop
        let data = await client.brpop(redis_keys.PUBLIC_QUEUE, 0);
        room_num = parseInt(data[1]);
        room_data = await client.get(`${redis_keys.ROOM_DATA}${room_num}`);
      }while(room_data === null);
    }else{
      // If has a invite room code, find the room 
      room_num = parseInt(inviteCode);
      room_data = await client.get(`${redis_keys.ROOM_DATA}${room_num}`);
      if(room_data === null) {res.status(200).json({code: 4, msg:"no room to join"}); return;}
    }
    // save the user 2 to the room
    room_data = JSON.parse(room_data);
    await client.setex(
      `${redis_keys.ROOM_DATA}${room_num}`, 
      ROOM_DATA_EXPIRE_TIME,
      JSON.stringify({
        ...room_data,
        user_2:{
          session_id: req.sessionID,
          username
        }
      })
    );

    // save back to the session
    req.session.room_num = room_num;
    res.status(200).json({code: 1, msg:"join success"});
  }catch(error){
    res.status(200).json({code: 0, msg:"join failed", error});
  }
};

module.exports = {
  login,
  exit,
  init,
  join
};