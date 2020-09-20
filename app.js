'use strict';

const createError = require('http-errors');
const express = require('express');
const {EventEmitter} = require('events');
const fs = require('fs');
const diff = require('diff');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const io = require('socket.io')();

const indexRouter = require('./routes/index');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);

var old_file = fs.readFileSync('var/file.txt', {encoding:"utf8"});
var fileEvent = new EventEmitter();

fileEvent.on('changed file', function(data){
  console.log('The file was changed and fired an event. This data was received:\n' + data);
});

fs.watch('var/file.txt', function(eventType, filename) {
  fs.promises.readFile(`var/${filename}`, {encoding:"utf8"})
    .then(function(data) {
    // only flash this message if the file's content has changed
    var new_file = data;
    if (new_file !== old_file) {
      console.log(`The content of ${filename} has changed: it was a ${eventType} event.`)
      var file_changes = diff.diffLines(old_file,new_file);
      /*
      console.log(`Here are the changes (promise!):`);
      */
      var all_changes = file_changes.map((change, i) => {
        if (change.added) {
          return `<li class="ins">${change.value}</li>`;
        }
        if (change.removed) {
          return `<li class="del">${change.value}</li>`;
        }
      });
      fileEvent.emit('changed file', all_changes.join('\n'));
    }
    old_file = new_file
  });
  }
);

// send a message on successful socket connection
io.on('connection', function(socket){
  socket.emit('message', 'Successfully connected.');
  socket.on('message received', function(data) {
    console.log('Client is saying a message was received: ' + data);
  });
  fileEvent.on('changed file', function(data) {
    socket.emit('diffed changes', data);
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
