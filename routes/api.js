'use strict';

const express = require('express');
const fs = require('fs');
const router = express.Router();

/* GET latest headlines */
router.get('/latest', function(req, res, next) {
  fs.promises.readFile('var/abc.latest.json', {encoding: "utf8"})
    .then(function(data) {
      res.json(JSON.parse(data));
    })
    .catch(function(error) {
      res.status(500).json({'error': error});
    });
});

/* GET all headlines */
router.get('/all', function(req, res, next) {
  fs.promises.readFile('var/abc.old.json', {encoding: "utf8"})
    .then(function(data) {
      res.json(JSON.parse(data));
    })
    .catch(function(error) {
      res.status(500).json({'error': error});
    });
});

module.exports = router;
