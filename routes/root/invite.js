'use strict';

var inviteService = require('../../services/invite');

function views_path(action) {
  return 'invite/' + action;
}

function index(req, res, next) {
  inviteService.findInvite(req.params.token, function(error, invite) {
    res.render(views_path('index'), simpleParams('Invite', invite, error));
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
      if(invite && invite.userType == 'new') {
        res.render(views_path('index'), simpleParams('Accept Invite', invite));
      }
      else {
        req.flash('message', message);
        res.redirect('/login');
      }
    }
  });
};

function acceptPost(req, res, next) {
  inviteService.acceptInviteNew(req.params.token, req.body, function(error, invite, message) {
    if(error) {
      res.render(views_path('index'), simpleParams('Invite', invite, error));
    }
    else {
      req.flash('message', message);
      res.redirect('/login');
    }
  });
};

function simpleParams(title, invite, error, message) {
  return { title: title, invite: invite || {}, error: error || {}, message: message || '' };
};

function sessionAccept(req, res, next) {
  inviteService.sessionAccept(req.params.token).then(function(message) {
    req.flash('message', message);
    res.redirect('/login');
  }, function(error) {
    req.flash('message', error);
    res.redirect('/login');
  });
}

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
  sessionAccept: sessionAccept,
  sessionNotThisTime: sessionNotThisTime,
  sessionNotAtAll: sessionNotAtAll
};
