'use strict';

var accountManagerService = require('../../services/accountManager');
var inviteService = require('../../services/invite');
var _ = require('lodash');

function views_path(action) {
  return 'dashboard/accountManager/' + action;
};

function index(req, res, next) {
  accountManagerService.findAccountManagers(req.user, function(error, users) {
    res.render(views_path('index'), { title: 'Account Managers', users: users, message: req.flash('message')[0] });
  });
};

function manage(req, res, next) {
  res.render(views_path('manage'), simpleParams({}, {}, ''));
};

function create(req, res, next) {
  accountManagerService.createOrFindUser(req, function(error, params) {
    if(error) {
      return res.render(views_path('manage'), simpleParams(req.body, error));
    }

    let sendEmail = true;
    inviteService.createInvite(params, sendEmail, function(error, invite) {
      if(error) {
        res.render(views_path('manage'), simpleParams(req.body, error));
      }
      else {
        req.flash('message', 'Successfully sent invite.');
        res.redirect('../accountManager');
      }
    });
  });
};

function destroy(req, res, next) {
  accountManagerService.removeInviteOrAccountUser(req, function(error, message) {
    req.flash('message', error || message);
    res.redirect('/dashboard/accountmanager');
  });
};

function simpleParams(account, error, message) {
  if(!_.isEmpty(error)) {
    error.message = 'Something went wrong';
  }

  return { title: 'Manage Account Managers', error: error || {}, message: message, account: account };
};

module.exports = {
  index: index,
  manage: manage,
  create: create,
  destroy: destroy
};
