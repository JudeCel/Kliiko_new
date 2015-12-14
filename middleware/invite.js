'use strict';

var inviteService = require('../services/invite');

function views_path(action) {
  return 'invite/' + action;
};

function index(req, res) {
  inviteService.findInvite(req.params.token, function(error, invite) {
    if(error) {
      res.render(views_path('notFound'), simpleParams('Invite not found', {}, error));
    }
    else {
      res.render(views_path('index'), simpleParams('Invite', invite));
    }
  });
}

function decline(req, res) {
  inviteService.findInvite(req.params.token, function(error, invite) {
    if(error) {
      return res.render(views_path('notFound'), simpleParams('Invite not found', {}, error));
    }

    inviteService.declineInvite(invite, function(error, message) {
      if(error) {
        res.render(views_path('index'), simpleParams('Invite', invite, error));
      }
      else {
        req.flash('message', message);
        res.redirect('/login');
      }
    });
  });
}

function acceptGet(req, res) {
  inviteService.findInvite(req.params.token, function(error, invite) {
    if(error) {
      return res.render(views_path('notFound'), simpleParams('Invite not found', {}, error));
    }

    if(invite.userType == 'existing') {
      inviteService.acceptInviteExisting(invite, function(error, message) {
        if(error) {
          res.render(views_path('index'), simpleParams('Invite', invite, error));
        }
        else {
          req.flash('message', message);
          res.redirect('/login');
        }
      });
    }
    else {
      res.render(views_path('accept'), simpleParams('Accept Invite', invite));
    }
  });
}

function acceptPost(req, res) {
  inviteService.findInvite(req.params.token, function(error, invite) {
    if(error) {
      return res.render(views_path('notFound'), simpleParams('Invite not found', {}, error));
    }

    if(invite.userType == 'new') {
      inviteService.acceptInviteNew(invite, req.body, function(error, message) {
        if(error) {
          res.render(views_path('accept'), simpleParams('Invite', invite, error));
        }
        else {
          req.flash('message', message);
          res.redirect('/login');
        }
      });
    }
    else {
      res.render(views_path('notFound'), simpleParams('Invite not found', invite));
    }
  });
}

function simpleParams(title, invite, error, message) {
  return { title: title, invite: invite, error: error, message: message || '' };
}

module.exports = {
  index: index,
  decline: decline,
  acceptGet: acceptGet,
  acceptPost: acceptPost
}
