'use strict';

const express = require('express');
const router = express.Router();

const apiController = require('../controllers/api');

/* GET latest headlines */
router.get('/latest', apiController.latest);

/* GET all headlines */
router.get('/all', apiController.all);

module.exports = router;
