'use strict';

var models = require('./../models');
var AccountUser = models.AccountUser;
var User = models.User;
var userService = require('./../services/users');
var accountUserService = require('./../services/accountUser');
var _ = require('lodash');

function findUserManagers(user, callback) {
  AccountUser.findAll({ include: [ User ], where: { accountId: user.accountId } }).done(function(result) {
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

  params.password = 'qwerty123';
  params.accountName = 'guskis';
  userService.create(params, function(error, newUser) {
    if(error) {
      callback(error);
    }
    else {
      User.find({ where: { id: user.id } }).done(function(result) {
        newUser.getAccounts().then(function(accounts) {
          accountUserService.createWithRole(accounts[0], result, 'participant', function(error, user) {
            if(error) {
              callback(error);
            }
            else {
              callback(null, newUser);
            }
          });
        });
      });
    }
  });
}

function simpleParams(error, message, account, req) {
  return { title: 'Manage Account Managers', error: error || {}, message: message, account: account };
}

function prepareParams(req, errors) {
  return _.pick(req.body, ['firstName', 'lastName', 'gender', 'email', 'mobile', 'postalAddress', 'city', 'postCode', 'companyName', 'landlineNumber']);
}

module.exports = {
  findUserManagers: findUserManagers,
  createOrUpdateManager: createOrUpdateManager,
  simpleParams: simpleParams
}
