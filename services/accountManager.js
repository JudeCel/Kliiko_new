'use strict';

var models = require('./../models');
var AccountUser = models.AccountUser;
var User = models.User;
var Account = models.Account;
var userService = require('./../services/users');
var accountUserService = require('./../services/accountUser');
var _ = require('lodash');

//Exports
function findUserManagers(user, callback) {
  AccountUser.findAll({
    include: [ User ],
    where: {
      accountId: user.accountId,
      userId: { $ne: user.id }
    }
  }).done(function(result) {
    if(result) {
      callback(null, result);
    }
    else {
      callback(true);
    };
  });
}

function createOrUpdateManager(req, callback) {
  let user = req.user,
      params = prepareParams(req);

  User.find({
    include: [ Account ],
    where: { email: params.email }
  }).done(function(foundUser) {
    if(foundUser) {
      createAccountUser(user, foundUser, callback);
    }
    else {
      params.password = 'qwerty123';
      params.accountName = 'guskis';
      userService.create(params, function(error, newUser) {
        if(error) {
          callback(error);
        }
        else {
          createAccountUser(user, newUser, callback);
        }
      });
    }
  });
}

function remove(req, callback) {
  let user = req.user,
      accountUserId = req.params.id;

  AccountUser.find({
    where: {
      id: accountUserId,
      accountId: user.accountId,
      userId: { $ne: user.id }
    }
  }).done(function(result) {
    if(result) {
      result.destroy().then(function() {
        callback(null, 'Successfully removed account from Account List');
      });
    }
    else {
      callback('Account not found or your are not owner');
    }
  });
}

function simpleParams(error, message, account, req) {
  return { title: 'Manage Account Managers', error: error || {}, message: message, account: account };
}

//Helpers
function createAccountUser(user, foundUser, callback) {
  User.find({ where: { id: user.id } }).done(function(currentUser) {
    foundUser.getAccounts().then(function(accounts) {
      accountUserService.createWithRole(accounts[0], currentUser, 'participant', function(error, user) {
        if(error) {
          callback(error);
        }
        else {
          callback(null, true);
        }
      });
    });
  });
}

function prepareParams(req, errors) {
  return _.pick(req.body, ['firstName', 'lastName', 'gender', 'email', 'mobile', 'postalAddress', 'city', 'postCode', 'companyName', 'landlineNumber']);
}

module.exports = {
  findUserManagers: findUserManagers,
  createOrUpdateManager: createOrUpdateManager,
  remove: remove,
  simpleParams: simpleParams
}
