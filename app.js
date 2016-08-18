"use strict";
var express = require('express');
var session = require('express-session');
var RedisStore = require('connect-redis')(session);
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('./middleware/passport');
var subdomain = require('./middleware/subdomain');
var letsencrypt = require('./middleware/letsencrypt');
var currentUser = require('./middleware/currentUser');
var sessionMiddleware = require('./middleware/session');
var flash = require('connect-flash');
var app = express();
var fs = require('fs');
var airbrake = require('./lib/airbrake').instance;
app.use(airbrake.expressHandler());
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.set('view options', { layout: 'layout.ejs' });

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  store: new RedisStore({
      port: process.env.REDIS_PORT,
      host: process.env.REDIS_HOST,
      db: parseInt(process.env.REDIS_DB)
  }),
  cookie: { domain: process.env.SERVER_BASE_DOMAIN},
  domain: process.env.SERVER_BASE_DOMAIN,
  secret: process.env.SESSION_SECRET,
  name: process.env.SESSION_COOKIES_NAME,
  saveUninitialized: false,
  rolling: true,
  resave: true
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(subdomain);
app.use(flash());

var routes = require('./routes/root');
var dashboard = require('./routes/dashboard');
var resources = require('./routes/resources');
var api = require('./routes/api');

app.use('/', routes);
app.use('/dashboard', sessionMiddleware.extendUserSession, currentUser.assign, dashboard);
app.use('/resources', sessionMiddleware.extendUserSession, currentUser.assign, resources);
app.use('/api', sessionMiddleware.extendUserSession, currentUser.assign, api);

// Added socket.io routes
// catch 404 and forward to error handler

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
  airbrake.notify(err);
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

module.exports = app;
