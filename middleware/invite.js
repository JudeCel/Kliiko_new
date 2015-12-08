'use strict';
var inviteService = require('../services/invite');

function views_path(action) {
  return 'invite/' + action;
};

function get(req, res) {
  console.log(req.params);
  inviteService.findInvite(req.params.token, function(error, result) {
    if(error) {
      console.log(error);
      res.render(pageTypes('notFound'), { title: 'Invite not found', error: error });
    }
    else {
      res.render(pageTypes(req.params.type), { title: 'Accept Invite', invite: result, error: '' });
    }
  });
};

function post(req, res) {
  console.log(req.params);
  inviteService.findInvite(req.params.token, function(error, result) {
    if(error) {
      console.log(error);
      res.render(pageTypes('notFound'), { title: 'Invite not found', error: error });
    }
    else {
      acceptInvite(result);
      // res.render(pageTypes(req.params.type), { title: 'Accept Invite', invite: result, error: '' });
    }
  });
};

function acceptInvite(invite, callback) {
  console.log(invite.AccountUser);
};

function pageTypes(type) {
  let pages = {
    accept: views_path('accept'),
    decline: views_path('decline')
  };

  return pages[type] || views_path('notFound');
};

module.exports = {
  get: get,
  post: post
}
