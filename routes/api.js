'use strict';

const express = require('express');
const fs = require('fs');
const router = express.Router();

/* GET latest headlines */
router.get('/latest', function(req, res, next) {
  res.sendFile('abc.latest.json', {root: './var/'});
});

/* GET all headlines */
router.get('/all', function(req, res, next) {
  res.sendFile('abc.old.json', {root: './var/'});
});

module.exports = router;
