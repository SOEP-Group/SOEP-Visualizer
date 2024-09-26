const express = require('express');
const router = express.Router();
const controller = require('../controllers/index');


router.get('/', controller.Home);
router.get('/test', controller.Dynamic);
<<<<<<< HEAD
=======
router.get('/satellite_info/:id', controller.getSatelliteInfo);
>>>>>>> interface

module.exports = router;
