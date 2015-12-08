'use strict';

var models = require('./../models');
var AccountUser = models.AccountUser;
var User = models.User;
var Account = models.Account;
var Invite = models.Invite;
var userService = require('./../services/users');
var accountUserService = require('./../services/accountUser');
var async = require('async');
var _ = require('lodash');

//Exports
function findUserManagers(user, callback) {
  async.parallel([
    function(cb) {
      User.findAll({
        include: [{
          model: Account,
          where: { id: user.accountOwnerId }
        }],
        where: { id: { $ne: user.id } }
      }).then(function(users) {
        cb(null, users);
      }).catch(function(err) {
        cb(err);
      });
    },
    function(cb) {
      User.findAll({
        include: [{
          model: Invite,
          where: { accountId: user.accountOwnerId, role: 'accountManager' }
        }],
        where: { id: { $ne: user.id } }
      }).then(function(users) {
        cb(null, users);
      }).catch(function(err) {
        cb(err);
      });
    }
  ], function(err, results) {
    if(err) {
      console.log(err);
      callback(err);
    }
    else {
      callback(null, _.union(results[0], results[1]));
    }
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
      callback(null, { created: false, userId: foundUser.id, accountId: user.accountId });
      // createAccountUser(user.id, foundUser, false, callback);
    }
    else {
      params.password = 'qwerty123';
      params.accountName = 'guskis123';
      userService.create(params, function(error, newUser) {
        if(error) {
          callback(error);
        }
        else {
          callback(null, { created: true, userId: newUser.id, accountId: user.accountId });
          // createAccountUser(user.id, newUser, true, callback);
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
function createAccountUser(id, foundUser, created, callback) {
  User.find({ where: { id: id } }).done(function(currentUser) {
    foundUser.getOwnerAccount().then(function(accounts) {
      accountUserService.createNotOwner(accounts[0], currentUser, function(error, user) {
        if(error) {
          callback(error);
        }
        else {
          callback(null, created, user);
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
