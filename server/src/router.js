const cors = require("cors");
const express = require("express");

const {corsOption} = require("./variables/config");
const authController = require("./controller/auth");

var router = express.Router();

router.use(cors(corsOption));

// GET method routes
router.get("/", (req, res) => {
  res.send("Hello World");
});

// POST method routes
router.post("/login", authController.login);
router.post("/init", authController.init);
router.post("/exit", authController.exit);

module.exports = router;