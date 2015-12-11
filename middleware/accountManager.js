'use strict';

var accountManager = require('../services/accountManager');
var inviteService = require('../services/invite');

function views_path(action) {
  return 'dashboard/' + action;
};

function index(req, res) {
  accountManager.findAccountManagers(req.user, function(error, users) {
    res.render(views_path('accountManager'), { title: 'Account Managers', users: users, message: req.flash('message')[0] });
  });
};

function manageGet(req, res) {
  res.render(views_path('accountManager/manage'), accountManager.simpleParams({}, '', {}));
};

function managePost(req, res) {
  accountManager.createOrFindUser(req, function(error, params) {
    if(error) {
      res.render(views_path('accountManager/manage'), accountManager.simpleParams(error, 'Something went wrong', req.body));
    }
    else {
      inviteService.createInvite(params, true, function(error, invite) {
        if(error) {
          res.render(views_path('accountManager/manage'), accountManager.simpleParams(error, 'Something went wrong', req.body));
        }
        else {
          res.redirect('../accountmanager');
        }
      });
    }
  });
};

function destroy(req, res) {
  accountManager.removeInviteOrAccountUser(req, function(error, message) {
    if(error) {
      req.flash('message', error);
    }
    else {
      req.flash('message', message);
    }

    res.redirect('/dashboard/accountmanager');
  });
};

module.exports = {
  index: index,
  manageGet: manageGet,
  managePost: managePost,
  destroy: destroy
}
