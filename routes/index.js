const express = require('express');
const router = express.Router();
const controller = require('../controllers/index');

// Existing routes
router.get('/', controller.Home);
router.get('/test', controller.Dynamic);

// New route to render the EJS template with data
router.get('/satellite', controller.RenderSatellite);

module.exports = router;
