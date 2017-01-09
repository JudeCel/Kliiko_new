'use strict';

var userRoutes = require('./user.js');
var inviteService = require('../../services/invite');
var middlewareFilters = require('../../middleware/filters');
var _ = require('lodash');

var MessagesUtil = require('./../../util/messages');

function views_path(action) {
  return 'invite/' + action;
}

function index(req, res, next) {
  inviteService.findInvite(req.params.token).then((invite) => {
    inviteService.findUserInSystemByEmail(invite.AccountUser.email).then((user) => {
      if (user) {
        renderLogin(res, user);
      } else {
        res.render(views_path('newUser'), simpleParams('Invite', invite, {}));
      }
    });
  }, (error) => {
    console.log(error, "invite.js:24");
    res.redirect('/login');
  });
}

function decline(req, res, next) {
  inviteService.declineInvite(req.params.token).then(({invite, message}) => {
    req.flash('message', message);
    res.redirect('/login');
  }, (error) => {
    res.render(views_path('index'), simpleParams('Invite', {}, error));
  });
}

function accept(req, res, next) {
  inviteService.findInvite(req.params.token).then((invite) => {
    inviteService.acceptInvite(req.params.token, req.body).then(({user}) => {
      loginUser(req, res, next, user);
    }, (error) => {
      console.log(error);
      inviteService.findUserInSystemByEmail(invite.AccountUser.email).then((user) => {
        if (user) {
          res.render(views_path('index'), simpleParams('Invite', invite, error));
        } else {
          res.render(views_path('newUser'), simpleParams('Invite', invite, error));
        }
      })
    });
  }, (error) => {
    console.log(error, "invite.js:24");
    res.redirect('/login');
  });
};

function renderLogin(res, user) {
  res.render('login', {
    title: 'Login',
    error: '',
    message: '',
    email: user ? user.email : '',
    googleUrl: '/auth/google',
    facebookUrl: '/auth/facebook'
  });
}

function loginUser(req, res, next, user) {
  if(req.body.social) {
    req.login(user, function(err) {
      middlewareFilters.myDashboardPage(req, res, next);
    });
  } else {
    req.body.email = user.email;
    userRoutes.login(req, res, next);
  }
}

function simpleParams(title, invite, errors, message) {
  return {
    title: title,
    invite: invite || {},
    errors: processedErrosMessage(errors || {}),
    message: message || '',
    applicationName: process.env.MAIL_FROM_NAME,
    googleUrl: '/invite/auth/google/' + invite.token,
    facebookUrl: '/invite/auth/facebook/' + invite.token,
  };
};
function processedErrosMessage(errors) {
  let message = [];
  _.map(["password", "email"], function(item) {
    if (errors[item]) {
      message.push(errors[item]);
    }
  })
  return message
}

function sessionAccept(req, res, next) {
  inviteService.acceptSessionInvite(req.params.token).then(function({invite, message}) {
    if (invite.AccountUser.UserId) {
      inviteService.findUserInSystemByEmail(invite.AccountUser.email).then((user) => {
        renderLogin(res, user);
      });
    } else {
      res.render(views_path('newUser'), simpleParams('Invite', invite, {}));
    }
  }, function(error) {
    console.log(error);
    req.flash('message', { inviteError: true});
    res.redirect('/login');
  });
}

function sessionNotThisTime(req, res, next) {
  inviteService.declineSessionInvite(req.params.token, 'notThisTime').then(function(result) {
    res.render(views_path('declined'), simpleParams('Invite', result.invite));
  }, function(error) {
    req.flash('message', error);
    res.redirect('/login');
  });
}

function sessionNotAtAll(req, res, next) {
  inviteService.declineSessionInvite(req.params.token, 'notAtAll').then(function(result) {
    res.render(views_path('declined'), simpleParams('Invite', result.invite));
  }, function(error) {
    req.flash('message', error);
    res.redirect('/login');
  });
}

module.exports = {
  index: index,
  decline: decline,
  accept: accept,
  sessionAccept: sessionAccept,
  sessionNotThisTime: sessionNotThisTime,
  sessionNotAtAll: sessionNotAtAll
};
