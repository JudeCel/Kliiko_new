'use strict';

var models = require('./../models');
var filters = require('./../models/filters');
var AccountUser = models.AccountUser;
var SessionMember = models.SessionMember;
var User = models.User;
var _ = require('lodash');
var q = require('q');

const VALID_ATTRIBUTES = {
  accountUser: [
    'id',
    'role'
  ],
  sessionMember: [
    'id',
    'role',
    'sessionId'
  ]
};

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

function updateAccountUserWithId(data, userId, transaction, callback) {
  AccountUser.update(data, {
    where: {
      UserId: userId
    },
    transaction: transaction
  }).then(function (result) {
      callback(null, result);
  }).catch(function (err) {
    callback(err);
  });
}

function updateWithUserId(data, userId, callback) {
    models.sequelize.transaction().then(function(t) {
      User.find({
        where: {
          id: userId
        }
      }).then(function (result) {
        result.update(data, {transaction: t}).then(function(updateResult) {
          updateAccountUserWithId(data, userId, t, function(err, accountUserResult) {
            if (err) {
              t.rollback().then(function() {
              callback(err);
              });
            } else {
              t.commit().then(function() {
                callback();
              });
            }
          });
        }).catch(function(updateError) {
          callback(updateError);
        });
      }).catch(function (err) {
        callback(err);
      });
  });
}

function findWithSessionMembers(userId, accountId) {
  let deferred = q.defer();

  AccountUser.find({
    where: {
      AccountId: accountId,
      UserId: userId
    },
    attributes: VALID_ATTRIBUTES.accountUser
  }).then(function(accountUser) {
    if(accountUser) {
      joinSessionMembers(accountUser.dataValues).then(function() {
        deferred.resolve(accountUser);
      }, function(error) {
        deferred.reject(error);
      });
    }
    else {
      deferred.reject({ message: 'AccountUser not found' });
    }
  }).catch(function(error) {
    deferred.reject(error);
  });

  return deferred.promise;
}

function joinSessionMembers(accountUser) {
  let deferred = q.defer();

  SessionMember.findAll({
    where: {
      accountUserId: accountUser.id
    },
    attributes: VALID_ATTRIBUTES.sessionMember
  }).then(function(results) {
    accountUser.SessionMembers = results;
    deferred.resolve();
  }).catch(function(error) {
    deferred.reject(error);
  });

  return deferred.promise;
}

module.exports = {
  create: create,
  createAccountManager: createAccountManager,
  updateWithUserId: updateWithUserId,
  findWithSessionMembers: findWithSessionMembers
}
