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

const login = (req, res)=>{
  /**
   * TODO: implement validation using `joi`
   */
  try {
    const { username, isPrivate } = req.body;
    req.session.username = username;
    
    res.status(200).json({code: 1, msg:"login success"});
  } catch (error) {
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