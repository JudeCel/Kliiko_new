'use strict';

var MessagesUtil = require('./../../util/messages');
var accountManagerService = require('../../services/accountManager');
var inviteService = require('../../services/invite');

function get(req, res, next) {
  accountManagerService.findAccountManagers(req.currentResources.account.id).then(function(accountUsers) {
    res.send({ accountUsers: accountUsers });
  }, function(error) {
    res.send({ error: error });
  });
};

function canAddAccountManager(req, res, next) {
  accountManagerService.canAddAccountManager(req.currentResources.account.id).then(function(response) {
    res.send(response);
  }, function(error) {
    res.send({ error: error });
  });
}

function post(req, res, next) {
  accountManagerService.createOrFindAccountManager(req.currentResources.user, req.body, req.currentResources.account.id).then(function(params) {
    inviteService.createInvite(params).then(function(data) {
      res.send({ invite: data, message: MessagesUtil.routes.accountManager.invite });
    }, function(error) {
      res.send({ error: error });
    });
  }, function(error) {
    res.send({ error: error });
  });
};

function put(req, res, next) {
  accountManagerService.updateAccountManager(req.body).then(function(response) {
    res.send(response);
  }, function(error) {
    res.send({ error: error });
  })
}

function removeInvite(req, res, next) {
  var params = { accountUserId: req.query.id };

  inviteService.findAndRemoveAccountManagerInvite(params, function(error, message) {
    if(error) {
      res.send({ error: error });
    }
    else {
      res.send({ message: message });
    }
  });
};

function removeAccountUser(req, res, next) {
  accountManagerService.findAndRemoveAccountUser(req.query.id, req.currentResources.account.id).then(function(message) {
    res.send({ message: message });
  }, function(error) {
    res.send({ error: error });
  });
};

module.exports = {
  get: get,
  post: post,
  put: put,
  removeInvite: removeInvite,
  removeAccountUser: removeAccountUser,
  canAddAccountManager: canAddAccountManager
};
