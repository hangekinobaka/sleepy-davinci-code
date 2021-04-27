const express = require("express");
const cookieParser = require("cookie-parser");

const router = require("../routes/router");
const session = require("../middleware/session");
const {SESSION_SECRET} = require("../variables/config");

module.exports = function (app) {
  app.use(cookieParser(SESSION_SECRET));
  // To process the req body
  app.use(express.json());
  app.use(session);
  app.use(router);
  
  // if you run behind a proxy (e.g. nginx)
  // app.set('trust proxy', 1);
};