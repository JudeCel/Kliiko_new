'use strict';

var models = require('./../../models');
var {User,Account, AccountUser} = models

var usersServices  = require('./../../services/users');

var q = require('q');
var async = require('async');

module.exports = {
  createUserAndOwnerAccount: createUserAndOwnerAccount,
  createAdminUser: createAdminUser,
  createMultipleAccountUsers: createMultipleAccountUsers
}

function createAdminUser(params) {
  return Account.create({ name: params.role, admin: true }).then(function(account) {
    return User.create(params).then((user) => {
      return AccountUser.create({
        UserId: user.id,
        AccountId: account.id,
        firstName: params.firstName,
        lastName: params.lastName,
        gender: params.gender,
        email: params.email,
        role: params.role
      });
    })
  });
}


function createUserAndOwnerAccount(params) {
  let deferred = q.defer();

  let attrs = {
    accountName: 'BLauris',
    firstName: 'Lauris',
    lastName: 'Bligzna',
    password: 'multipassword',
    email: 'bligzna.lauris@gmail.com',
    gender: 'male'
  }

  usersServices.create(params || attrs, function(error, user) {
    if(error) {
      deferred.reject(error);
    }
    else {
      user.getOwnerAccount().then(function(accounts) {
        models.AccountUser.find({
          where: {
            UserId: user.id,
            AccountId: accounts[0].id
          }
        }).then(function(accountUser) {
          deferred.resolve({ user: user, account: accounts[0], accountUser: accountUser });
        }).catch(function(error) {
          deferred.reject(error);
        })
      });
    }
  });

  return deferred.promise;
}

function createMultipleAccountUsers(roles, testData) {
  let deferred = q.defer();

  async.each(roles, function(role, callback) {
    Account.create({ name: role }).then(function(account) {
      AccountUser.create({
        UserId: testData.user.id,
        AccountId: account.id,
        firstName: testData.accountUser.firstName,
        lastName: testData.accountUser.lastName,
        gender: testData.accountUser.gender,
        email: testData.accountUser.email,
        role: role
      }).then(function(accountUser) {
        callback();
      }).catch(function(error) {
        callback(error);
      });
    }).catch(function(error) {
      callback(error);
    });
  }, function(error) {
    if(error) {
      deferred.reject(error);
    }
    else {
      deferred.resolve();
    }
  });

  return deferred.promise;
}
