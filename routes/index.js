const express = require('express');
const router = express.Router();
const controller = require('../controllers/index');

router.get('/', controller.Home);
router.get('/test', controller.Dynamic);
router.get('/satellite_info/:id', controller.getSatelliteInfo); 

// New route to render the EJS template with data
router.get('/satellite', controller.RenderSatellite);

module.exports = router;
