'use strict';

var MessagesUtil = require('./../util/messages');
var constants = require('./../util/constants');
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
  .then(function(accountUser) {
    let contactList = selectAccountManagerContactList(object.contactLists);
    if(contactList) {
      let cluParams = contactListUserParams({ accountId: accountUser.AccountId, contactListId: contactList.id }, accountUser);
      models.ContactListUser.create(cluParams, {transaction: object.transaction}).then(function() {
        callback(null, object);
      }, function(error) {
        _.merge(object.errors, filters.errors(error));
        callback(null, object);
      });
    }
    else {
      object.errors.contactList = 'Contact List not found';
      callback(null, object);
    }
  }, function(error) {
    _.merge(object.errors, filters.errors(error));
    callback(null, object);
  });
}

function selectAccountManagerContactList(contactLists) {
  for(var i in contactLists) {
    if(contactLists[i].role == 'accountManager') {
      return contactLists[i];
    }
  }
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
      deferred.reject({ message: MessagesUtil.accountUser.notFound });
    }
  }).catch(function(error) {
    deferred.reject(filters.errors(error));
  });

  return deferred.promise;
}

function contactListUserParams(params, accountUser) {
  return {
    userId: accountUser.UserId,
    accountUserId: accountUser.id,
    accountId: params.accountId,
    contactListId: params.contactListId,
    customFields: params.customFields || {}
  }
}

function findWithUser(user) {
  let deferred = q.defer();

  models.User.find({
    where: { id: user.id },
    include: [models.AccountUser],
  }).then(function(result) {
    assignCurrentUserInfo(result.AccountUsers[0] || {}, user);
    deferred.resolve(user);
  }, function(error) {
    deferred.reject(filters.errors(error));
  });

  return deferred.promise;
}

function assignCurrentUserInfo(accountUser, user) {
  _.merge(user, _.pick(accountUser.dataValues, prepareValidAccountUserParams()));
  user.accountUserId = accountUser.id;
}

function prepareValidAccountUserParams() {
  let safeAccountUserParams = _.cloneDeep(constants.safeAccountUserParams);
  let index = safeAccountUserParams.indexOf('id');
  safeAccountUserParams.splice(index, 1);
  return safeAccountUserParams;
}

module.exports = {
  create: create,
  createAccountManager: createAccountManager,
  updateWithUserId: updateWithUserId,
  findWithUser: findWithUser,
  findWithSessionMembers: findWithSessionMembers
}
