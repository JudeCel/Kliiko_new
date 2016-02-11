'use strict';

var models = require('./../models');
var filters = require('./../models/filters');
var AccountUser = models.AccountUser;
var _ = require("lodash");
var q = require('q');

function createAccountManager(object, callback) {
  object.errors = object.errors || {};

  AccountUser.create(prepareAccountManagerParams(object.params, object.account, object.user), { transaction: object.transaction })
  .then(function(_result) {
    callback(null, object);
  }, function(error) {
    _.merge(object.errors, filters.errors(error));
    callback(null, object);
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
