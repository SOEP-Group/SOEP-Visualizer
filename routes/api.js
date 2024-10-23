const express = require('express');
const router = express.Router();
const controller = require('../controllers/api');

router.get('/satellites', controller.getAllSatellites);

module.exports = router;