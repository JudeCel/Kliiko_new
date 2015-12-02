'use strict';
var accountManager = require('../services/accountManager');
var User = require('./../models').User;

function views_path(action) {
  return 'dashboard/' + action;
};

function index(req, res) {
  accountManager.findUserManagers(req.user, function(error, result) {
    res.render(views_path('accountManager'), { title: 'Account Managers', accounts: result });
  });
};

function manageGet(req, res) {
  res.render(views_path('accountManager/manage'), accountManager.simpleParams({}, '', {}, req));
};

function managePost(req, res) {
  accountManager.createOrUpdateManager(req, function(error, result) {
    if(error) {
      res.render(views_path('accountManager/manage'), accountManager.simpleParams(error, 'Something went wrong', req.body, req));
    }
    else {
      res.redirect('../accountmanager');
    }
  });
};

function destroy(req, res) {

};

module.exports = {
  index: index,
  manageGet: manageGet,
  managePost: managePost,
  destroy: destroy
}
