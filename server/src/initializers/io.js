const sharedsession = require("express-socket.io-session");

const session = require("../middleware/session");
const router = require("../routes/io-router");

module.exports = function (io) {
  io.use(sharedsession(session, {
    autoSave:true
  })); 
  router(io);
};
