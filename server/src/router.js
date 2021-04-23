var cors = require('cors');
var express = require('express');
var cookieParser = require('cookie-parser')

const {corsOption} = require('./configs/options')

var router = express.Router();

router.use(cors(corsOption))
router.use(cookieParser())

// GET method routes
router.get("/", cookieValidator, (req, res) => {
  res.send({ response: "Hello, World!!!" }).status(200);
});
router.get("/test", (req, res) => {
  res.send({ response: "test" }).status(200);
});

// POST method routes
router.post('/login', function (req, res) {
  res.cookie('session_id', '12234455')
  res.status(200).json({msg:"success"});
})

// Middlewares
function cookieValidator(req, res, next){
  const {cookies} = req
  console.log(cookies)
  if('session_id' in cookies){

  }else{
    res.status(403).send({ msg: "validation failed" })
  }

  next()
}

module.exports = router;