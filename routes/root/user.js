'use strict';

var passport = require('passport');
var session = require('../../middleware/session');
var middlewareFilters = require('../../middleware/filters');
var usersService = require('../../services/users');
var MessagesUtil = require('../../util/messages');

module.exports = {
  login: login
};

function login(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    if (err || !user) {
      usersService.inviteInProcessExists(req.body.email, function(exists, token) {
        let error = exists ?
          { dialog: {link: { url: '/invite/' + token + '/accept/', title: "Continue to Check In" }, message: MessagesUtil.users.dialog.emailExistsContinueToCheckIn} } :
          (err || info.message);
        return res.render('login', {title: 'Login', error: error, message: '', email: ''});
      });
    } else {
      req.login(user, function(err) {
        if (err) {
          return next(err);
        }
        session.createUserSession(req, function(err, result) {
          if (err) { throw err}
          middlewareFilters.myDashboardPage(req, res, next);
        });
      });
    }
  })(req, res, next);
}
