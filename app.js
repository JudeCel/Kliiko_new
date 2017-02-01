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
var jwtMiddleware = require('./middleware/jwtMiddleware');
var subdomain = require('./middleware/subdomain');
var sessionMiddleware = require('./middleware/session');
var cors = require('cors');
const { setUpQueue} = require('./services/backgroundQueue.js');

var app = express();
var flash = require('connect-flash');
var _ = require('lodash');
var airbrake = require('./lib/airbrake').instance;
app.use(airbrake.expressHandler());
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.set('view options', { layout: 'layout.ejs' });

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(bodyParser.json({limit: '5mb'}));
app.use(bodyParser.urlencoded({limit: '5mb', extended: true }));
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

app.use(setUpQueue);
app.use(flash());
app.use(logger('dev'));
var api = require('./routes/api/index');
var apiPublic = require('./routes/api/public');
app.use('/api',  apiPublic);
app.use('/api', cors(), jwtMiddleware.jwt, jwtMiddleware.loadResources, api);

var routes = require('./routes/root');
var dashboard = require('./routes/dashboard');
var resources = require('./routes/resources');

app.use(passport.initialize());
app.use(passport.session());
app.use(subdomain);

app.use('/account-hub', sessionMiddleware.extendUserSession, dashboard);
app.use('/resources', sessionMiddleware.extendUserSession, resources);

app.use('/', routes);
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
