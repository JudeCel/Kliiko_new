'use strict';

var userRoutes = require('./user.js');
var inviteService = require('../../services/invite');
var middlewareFilters = require('../../middleware/filters');

function views_path(action) {
  return 'invite/' + action;
}

function index(req, res, next) {
  inviteService.findInvite(req.params.token, function(error, invite) {
    if(error == 'Invite not found') {
      res.redirect('/login');
    }
    else {
      if(invite.userType == 'existing') {
        acceptGet(req, res, next);
      }
      else {
        res.render(views_path('index'), simpleParams('Invite', invite, error));
      }
    }
  });
}

function decline(req, res, next) {
  inviteService.declineInvite(req.params.token, function(error, invite, message) {
    if(error) {
      res.render(views_path('index'), simpleParams('Invite', invite, error));
    }
    else {
      req.flash('message', message);
      res.redirect('/login');
    }
  });
}

function acceptGet(req, res, next) {
  inviteService.acceptInviteExisting(req.params.token, function(error, invite, message) {
    if(error) {
      res.render(views_path('index'), simpleParams('Invite', invite, error));

    }
    else {
      //added check if invite exists to avoid runtime error
      if (invite && invite.userType == 'new') {
        res.render(views_path('index'), simpleParams('Accept Invite', invite) );
      }
      else {
        req.flash('message', message);
        res.redirect('/login');
      }
    }
  });
}

function acceptPost(req, res, next) {
  inviteService.findInvite(req.params.token, function(error, invite) {
    if(error) {
      return res.render(views_path('index'), simpleParams('Invite', invite, error));
    }

    if(invite.sessionId) {
      inviteService.sessionAccept(req.params.token, req.body).then(function(data) {
        loginUser(req, res, next, data.user);
      }, function(error) {
        res.render(views_path('index'), simpleParams('Invite', invite, error));
      });
    }
    else {
      inviteService.acceptInviteNew(req.params.token, req.body, function(error, invite, user, message) {
        if(error) {
          res.render(views_path('index'), simpleParams('Invite', invite, error));
        }
        else {
          loginUser(req, res, next, user);
        }
      });
    }
  });
};

function loginUser(req, res, next, user) {
  if(req.body.social) {
    req.login(user, function(err) {
      middlewareFilters.myDashboardPage(req, res, next);
    });
  }
  else {
    req.body.email = user.email;
    userRoutes.login(req, res, next);
  }
}

function simpleParams(title, invite, error, message) {
  return { title: title, invite: invite || {}, error: error || {}, message: message || '' };
};

function sessionNotThisTime(req, res, next) {
  inviteService.declineSessionInvite(req.params.token, 'notThisTime').then(function(message) {
    req.flash('message', message);
    res.redirect('/login');
  }, function(error) {
    req.flash('message', error);
    res.redirect('/login');
  });
}

function sessionNotAtAll(req, res, next) {
  inviteService.declineSessionInvite(req.params.token, 'notAtAll').then(function(message) {
    req.flash('message', message);
    res.redirect('/login');
  }, function(error) {
    req.flash('message', error);
    res.redirect('/login');
  });
}

module.exports = {
  index: index,
  decline: decline,
  acceptGet: acceptGet,
  acceptPost: acceptPost,
  sessionNotThisTime: sessionNotThisTime,
  sessionNotAtAll: sessionNotAtAll
};
