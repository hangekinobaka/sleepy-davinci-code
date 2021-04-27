const PromiseClient = require("../utils/redis");
const client = new PromiseClient();
const { roomCodeGenerator } = require("../utils/user");
const {redis_keys} = require("../variables/config");

const init = (req, res)=>{
  try {
    if(req.session.username){
      res.status(200).json({code: 1, msg:"resume game"});
    }else{
      res.status(200).json({code: 2, msg:"no previous data"});
    }
  } catch (error) {
    res.status(403).json({code: 0, msg:"init failed"});
  }
};

const login = async (req, res)=>{
  /**
   * TODO: implement validation using `joi`
   */
  try {
    const { username, isPrivate } = req.body;
    req.session.username = username;

    // Generate and save room code
    const room = roomCodeGenerator(client);
    if(room === null) res.status(200).json({code: 3, msg:"room generate failed"});

    res.status(200).json({code: 1, msg:"login success"});
  } catch (error) {
    console.error(error);
    req.session.destroy();
    res.status(200).json({code: 0, msg:"login failed"});
  }
};

const exit = (req, res)=>{
  try {
    req.session.destroy();
    res.status(200).json({code: 1, msg:"exit success"});
  } catch (error) {
    res.status(200).json({code: 0, msg:"exit failed"});
  }
};

module.exports = {
  login,
  exit,
  init
};