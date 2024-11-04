const express = require("express");
const router = express.Router();
const controller = require("../controllers/index");

router.get("/", controller.Home);
router.get("/satellite/:id", controller.RenderSatellite);

module.exports = router;
