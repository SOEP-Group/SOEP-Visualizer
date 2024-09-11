const express = require('express');
const router = express.Router();
const controller = require('../controllers/index');


router.get('/', controller.Home);
router.get('/test', controller.Dynamic);

module.exports = router;
