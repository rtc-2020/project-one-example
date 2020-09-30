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

var old_headlines = JSON.parse(fs.readFileSync('var/abc.old.json', {encoding:"utf8"}));

var fileEvent = new EventEmitter();

fs.watch('var/abc.html', function(eventType, filename) {
  fs.promises.readFile(`var/${filename}`, {encoding:"utf8"})
    .then(function(data) {
      var new_file = data;
      // Use Cheerio to pull headlines of interest
      let qs = cheerio.load(new_file);
      let headlines = [];
      qs('.headlines-ul li a').each(function(i,elem){
        var data = qs(elem);
        var headline = {};
        headline.text = data.text().trim();
        headline.url = data.attr('href').trim();
        headlines.push(headline);
      });

      // Compare the old headlines with the new; return the new ones
      let new_headlines = util.findUniqueObjects(headlines,old_headlines,'url');

      // Only proceed if there are new headlines to work with
      if (new_headlines.length > 0) {
        // Process headlines into an HTML payload
        let html_headlines = new_headlines.map(function(hl) {
          return `<li><a href="${hl.url}">${hl.text}</a></li>`;
        });

        fileEvent.emit('new headlines', html_headlines);
        old_headlines = headlines;
        // Write latest headlines to files
        fs.promises.writeFile('var/abc.latest.json', JSON.stringify(new_headlines), {encoding:"utf8"});
        fs.promises.writeFile('var/abc.old.json', JSON.stringify(headlines), {encoding:"utf8"});
      }
    });
  });

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
