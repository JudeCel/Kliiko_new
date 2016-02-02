'use strict';

var models = require('./../models');
var AccountUser = models.AccountUser;
var _ = require("lodash");
var q = require('q');

function createAccountManager(params, account, user, t, callback) {
  AccountUser.create(prepareAccountManagerParams(params, account, user), { transaction: t })
  .then(function(result) {
    callback(null, user, params, t);
  }).catch(AccountUser.sequelize.ValidationError, function(err) {
    callback(err, null, null, t);
  }).catch(function(err) {
    callback(err, null, null, t);
  });
}

function prepareAccountManagerParams(params, account, user) {
  let  defaultStruct = {
    role: 'accountManager',
    owner: true,
    AccountId: account.id,
    UserId: user.id
  }
  return _.merge(params, defaultStruct);
}

function create(params, accountId, role, t) {
  var deferred = q.defer();
  AccountUser.create(buidAttrs(params, accountId, role), { transaction: t }).then(function(result) {
    deferred.resolve(result);
  }, function(error) {
    deferred.reject(error);
  });
  return deferred.promise;
}

function buidAttrs(params, accountId, role) {
  let defaultStruct = {
    status: 'added',
    active: false,
    role: role,
    AccountId: params.accountId
  }
  return _.merge(params, defaultStruct);
}



module.exports = {
  create: create,
  createAccountManager: createAccountManager
}
