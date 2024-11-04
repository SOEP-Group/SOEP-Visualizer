const express = require("express");
const router = express.Router();
const controller = require("../controllers/index");

router.get("/", controller.Home);
router.get("/satellite/:id", controller.RenderSatellite);
router.get("/orbit/:id", controller.getOrbitData);

module.exports = router;
