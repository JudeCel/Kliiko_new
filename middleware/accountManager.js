'use strict';
var accountManager = require('../services/accountManager');
var User = require('./../models').User;
var inviteMailer = require('../mailers/invite');

function views_path(action) {
  return 'dashboard/' + action;
};

function index(req, res) {
  accountManager.findUserManagers(req.user, function(error, users) {
    res.render(views_path('accountManager'), { title: 'Account Managers', users: users, message: req.flash('message')[0] });
  });
};

function manageGet(req, res) {
  res.render(views_path('accountManager/manage'), accountManager.simpleParams({}, '', {}, req));
};

function managePost(req, res) {
  accountManager.createOrUpdateManager(req, function(error, params) {
    if(error) {
      res.render(views_path('accountManager/manage'), accountManager.simpleParams(error, 'Something went wrong', req.body, req));
    }
    else {
      console.log(params);
      if(params.created) {
        inviteMailer.sendInviteNewUserToAccount({ userId: params.userId, accountId: params.accountId, role: 'accountManager' }, function(error) {
          console.log(error);
        });
      }
      else {
        inviteMailer.sendInviteNewUserToAccount({ userId: params.userId, accountId: params.accountId, role: 'accountManager' }, function(error) {
          console.log(error);
        });
      }
      // res.redirect('../accountmanager');
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
