const express = require('express');
const router = express.Router();
const controller = require('../controllers/index');

router.get('/', controller.Home);
router.get('/test', controller.Dynamic);
router.get('/satellite_info/:id', controller.getSatelliteInfo); 
router.get('/satellite', controller.RenderSatellite);
router.get('/api/satellites', controller.getAllSatellites);

module.exports = router;
