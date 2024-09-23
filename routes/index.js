const express = require('express');
const router = express.Router();
const controller = require('../controllers/index');


router.get('/', controller.Home);
router.get('/test', controller.Dynamic);
// router.get('/popup', controller.Popup);
// router.get('/satellite_info/:id', controller.getSatelliteInfo);

module.exports = router;
