'use strict';

var passport = require('passport');
var session = require('../../middleware/session');
var middlewareFilters = require('../../middleware/filters');

module.exports = {
  login: login
};

function login(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    if (err || !user) {
      return  res.render('login', {title: 'Login', error: err || info.message, message: ''});
    }
    req.login(user, function(err) {
      if (err) {
        return next(err);
      }
      session.createUserSession(req, function(err, result) {
        if (err) { throw err}
        middlewareFilters.myDashboardPage(req, res, next);
      });
    });
  })(req, res, next);
}
