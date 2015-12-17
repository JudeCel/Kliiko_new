"use strict";

var express = require('express');
var session = require('express-session');
var RedisStore = require('connect-redis')(session);
var config = require('config');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('./middleware/passport');
var subdomain = require('./middleware/subdomain');
var currentUser = require('./middleware/currentUser');
var flash = require('connect-flash');
var app = express();
var fs = require('fs');
var socketsServer = require('./chatRoom/sockets');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.set('view options', { layout: 'layout.ejs' });

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser(config.get("cookieSecret")));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  store: new RedisStore(config.get("redisSession")),
  secret: config.get("sessionSecret"),
  resave: true, saveUninitialized: false,
  domain: config.get('server')['baseDomain'],
  cookie: { domain: config.get('server')['baseDomain']}
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(subdomain);
app.use(flash());

var routes = require('./routes/root');
var dashboard = require('./routes/dashboard');

app.use('/', routes);
app.use('/dashboard', currentUser.assign, dashboard);

// Added socket.io routes
app = socketsServer.addRoutes(app);
// catch 404 and forward to error handler

initRestApiRouts();

app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

// Moment for DateTime formating
app.locals.moment = require('moment');

module.exports = app;


/**
 * Go through the restAPI folder, search and apply all routing rules
 */
function initRestApiRouts() {
  var restApiPath = config.get('webAppSettings.restApiUrl');

  fs.readdirSync('./restAPI').forEach(function(filename) {
    if (~filename.indexOf('.js')) require('./restAPI/' + filename)(app, restApiPath);
  });
}
