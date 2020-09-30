'use strict';

const cheerio = require('cheerio');
const createError = require('http-errors');
const express = require('express');
const {EventEmitter} = require('events');
const fs = require('fs');
const diff = require('diff');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const io = require('socket.io')();
const util = require('./lib/utilities');
const watch = require('./lib/watch');

const indexRouter = require('./routes/index');
const apiRouter = require('./routes/api');

const app = express();

var fileEvent = new EventEmitter();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/api', apiRouter);

watch.headlines(fileEvent);

// send a message on successful socket connection
io.on('connection', function(socket){
  socket.emit('message', 'Successfully connected.');
  socket.on('message received', function(data) {
    console.log('Client is saying a message was received: ' + data);
  });
  fileEvent.on('new headlines', function(data) {
    socket.emit('headlines', data);
  });
});



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = {app, io};
