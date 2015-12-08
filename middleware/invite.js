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
      res.render(pageTypes('notFound'), simpleParams('Invite not found', {}, error));
    }
    else {
      res.render(pageTypes(req.params.type), simpleParams('Invite', result));
    }
  });
};

function post(req, res) {
  console.log(req.body);
  console.log(req.params);
  inviteService.findInvite(req.params.token, function(error, result) {
    if(error) {
      console.log(error);
      return res.render(pageTypes('notFound'), simpleParams('Invite not found', {}, error));
    }
    else {
      if(req.params.type == 'accept') {
        inviteService.acceptInvite(result, req.body, function(error, message) {
          if(error) {
            res.render(pageTypes(req.params.type), simpleParams('Invite', result, error));
          }
          else {
            req.flash('message', message);
            res.redirect('/login');
          }
        });
      }
      else if(req.params.type == 'decline'){
        inviteService.declineInvite(result, function(error, message) {
          // console.log(error);
          // console.log(message);
          if(error) {
            res.render(pageTypes(req.params.type), simpleParams('Invite', result, error));
          }
          else {
            req.flash('message', message);
            res.redirect('/login');
          }
        });
      }
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
