'use strict';

var passport = require('passport');
var session = require('../../middleware/session');
var middlewareFilters = require('../../middleware/filters');
var usersService = require('../../services/users');
var MessagesUtil = require('../../util/messages');
var jwtToken = require('../../lib/jwt');

module.exports = {
  login: login,
  auth: auth
};

function login(req, res, next, skipMissingCredentialsError) {
  passport.authenticate('local', function(err, user, info) {
    if (err || !user) {
      usersService.inviteInProcessExists(req.body.email, function(exists, token) {
        let error = exists ?
          { dialog: {link: { url: '/invite/' + token + '/accept/', title: "Continue to Check In" }, message: MessagesUtil.users.dialog.invitationAccepted} } :
          (err || info.message);
        if (skipMissingCredentialsError && error == "Missing credentials") {
          error = '';
        }
        return res.render('login', {
          title: 'Login',
          error: error,
          message: '',
          email: req.body.email,
          googleUrl: '/auth/google',
          facebookUrl: '/auth/facebook'
         });
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

function auth(req, res, next) {
  if(!req.body.email || !req.body.password) {
    sendUnathorizedStatus(res, MessagesUtil.middleware.passport.credentialsNotProvided);
    return;
  }
  
  passport.authenticate('local', function(err, user, info) {
    if (err == MessagesUtil.middleware.passport.userPasswordMatch) { 
      sendUnathorizedStatus(res, err);
      return;
    }

    if(err) {
      sendInternalServerErrorStatus(res);
      return
    }

    req.login(user, function(err) {
      if (err) { 
        sendInternalServerErrorStatus(res); 
        return;
      }

      var token  = jwtToken.token(req.user.id, "User:", "/" );
      res.send({ token: token });
    });
  })(req, res, next);
}

function sendUnathorizedStatus(res, error) {
  res.status(401).send({error: error}); 
}

function sendInternalServerErrorStatus(res) {
  res.status(500).send(); 
}
