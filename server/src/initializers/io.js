const sharedsession = require("express-socket.io-session");

const session = require("../middleware/session");

module.exports = function (io) {
  io.use(sharedsession(session, {
    autoSave:true
  })); 
};
