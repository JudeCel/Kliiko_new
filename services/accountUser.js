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
    AccountId: params.accountId || accountId
  };
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
              callback(filters.errors(err));
              });
            } else {
              t.commit().then(function() {
                callback();
              });
            }
          });
        }).catch(function(updateError) {
          t.rollback().then(function() {
            callback(filters.errors(updateError));
          });
        });
      }).catch(function (err) {
        t.rollback().then(function() {
          callback(filters.errors(err));
        });
      });
  });
}

function findWithSessionMembers(userId, accountId) {
  let deferred = q.defer();

  AccountUser.find({
    attributes: VALID_ATTRIBUTES.accountUser,
    where: {
      AccountId: accountId,
      UserId: userId
    },
    include: [{
      model: SessionMember,
      attributes: VALID_ATTRIBUTES.sessionMember,
      required: false
    }]
  }).then(function(accountUser) {
    if(accountUser) {
      deferred.resolve(accountUser);
    }
    else {
      deferred.reject({ message: 'AccountUser not found' });
    }
  }).catch(function(error) {
    deferred.reject(filters.errors(error));
  });

  return deferred.promise;
}

module.exports = {
  create: create,
  createAccountManager: createAccountManager,
  updateWithUserId: updateWithUserId,
  findWithSessionMembers: findWithSessionMembers
}
