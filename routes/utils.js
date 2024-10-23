const express = require("express");
const router = express.Router();
const controller = require("../controllers/utils");

router.get("/get_suns_position", controller.getSunsPosition);

module.exports = router;
