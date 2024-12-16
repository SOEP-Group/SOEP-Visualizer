const express = require("express");
const router = express.Router();
const controller = require("../controllers/api");

router.get("/satellites", controller.getAllSatellites);
router.get("/filter-data", controller.getFilterData);
router.get("/bodies/events/:body", controller.getBodyEvents);
router.get("/predictions/predict_collision/:id", controller.predictCollision);

module.exports = router;
