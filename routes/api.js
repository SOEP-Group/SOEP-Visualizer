const express = require("express");
const router = express.Router();
const controller = require("../controllers/api");

router.get("/satellites", controller.getAllSatellites);
router.get("/filter-data", controller.getFilterData);

module.exports = router;
