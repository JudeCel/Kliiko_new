'use strict';
var accountManager = require('../services/accountManager');
var User = require('./../models').User;

function views_path(action) {
  return 'dashboard/' + action;
};

function index(req, res) {
  accountManager.findUserManagers(req.user, function(error, accounts) {
    res.render(views_path('accountManager'), { title: 'Account Managers', accounts: accounts, message: req.flash('message')[0] });
  });
};

function manageGet(req, res) {
  res.render(views_path('accountManager/manage'), accountManager.simpleParams({}, '', {}, req));
};

function managePost(req, res) {
  accountManager.createOrUpdateManager(req, function(error, created) {
    if(error) {
      if(created) {
        mailers.invite.sendInviteNewUserToAccount(params);
      }
      else {
        mailers.invite.sendInviteNewUserToAccount(params);
      }
      res.render(views_path('accountManager/manage'), accountManager.simpleParams(error, 'Something went wrong', req.body, req));
    }
    else {
      res.redirect('../accountmanager');
    }
  });
};

function destroy(req, res) {
  accountManager.remove(req, function(error, message) {
    if(error) {
      req.flash('message', error);
    }
    else {
      req.flash('message', message);
    }

    res.redirect('../../accountmanager');
  });
};

module.exports = {
  index: index,
  manageGet: manageGet,
  managePost: managePost,
  destroy: destroy
}
