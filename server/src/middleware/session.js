const session = require("express-session");
const redisStore = require("connect-redis")(session);

const { SESSION_SECRET, SESSION_EXPIRE_TIME } = require("../variables/config");

const PromiseClient = require("../utils/redis");
const promiseClient = new PromiseClient();
const client = promiseClient.getClient();


module.exports = session({
  name: "session-id",
  secret: SESSION_SECRET,
  // create new redis store.
  store: new redisStore({ client }),
  saveUninitialized: false,
  resave: false, // if false: not overwrite the sesstion if this call doesn't modify the session content
  cookie: {
    secure: false, // if true: only transmit cookie over https
    httpOnly: true, // if true: prevents client side JS from reading the cookie
    maxAge: SESSION_EXPIRE_TIME// session max age in milliseconds
  }
});