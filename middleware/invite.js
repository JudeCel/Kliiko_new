'use strict';

var inviteService = require('../services/invite');

function views_path(action) {
  return 'invite/' + action;
};

function get(req, res) {
  inviteService.findInvite(req.params.token, function(error, invite) {
    if(error) {
      res.render(pageTypes('notFound'), simpleParams('Invite not found', {}, error));
    }
    else {
      res.render(pageTypes(req.params.type), simpleParams('Invite', invite));
    }
  });
};

function post(req, res) {
  inviteService.findInvite(req.params.token, function(error, invite) {
    console.log("1 =================");
    console.log(error);
    if(error) {
      res.render(pageTypes('notFound'), simpleParams('Invite not found', {}, error));
    }
    else {
      inviteService.manageInvite(req.params.type, invite, req.body, function(error, message) {
        console.log("2 =================");
        console.log(error);
        if(error) {
          res.render(pageTypes(req.params.type), simpleParams('Invite', invite, error));
        }
        else {
          req.flash('message', message);
          res.redirect('/login');
        }
      });
    }
  });
};

function pageTypes(type) {
  let pages = {
    accept: views_path('accept'),
    decline: views_path('decline')
  };

  return pages[type] || views_path('notFound');
};

function simpleParams(title, invite, error, message) {
  return { title: title, invite: invite, error: error, message: message || '' };
}

module.exports = {
  get: get,
  post: post
}
