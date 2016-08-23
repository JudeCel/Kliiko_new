'use strict';

var MessagesUtil = require('./../util/messages');
var validators = require('./../services/validators');
var constants = require('../util/constants');
var models = require('./../models');
var filters = require('./../models/filters');
var AccountUser = models.AccountUser;
var User = models.User;
var Account = models.Account;

var async = require('async');
var _ = require('lodash');
var crypto = require('crypto');
var q = require('q');

module.exports = {
  createOrFindAccountManager: createOrFindAccountManager,
  findAccountManagers: findAccountManagers,
  findAndRemoveAccountUser: findAndRemoveAccountUser,
  updateAccountManager: updateAccountManager,
  canAddAccountManager: canAddAccountManager
};

//Exports
function createOrFindAccountManager(user, body, accountId) {
  let deferred = q.defer();
  let params = prepareParams(body);
  params.role = 'accountManager';
  delete params.id;

  canAddAccountManager(accountId).then(function() {
    AccountUser.build(params).validate().then(function(errors) {
      errors = errors || {};
      delete params.role;
      return preValidate(user, accountId, params.email, errors);
    }).then(function(errors) {
      if(_.isEmpty(errors)) {
        return User.find({ where: { email: params.email } });
      }
      else {
        throw errors;
      }
    }).then(function(existsUser) {
      if(existsUser) {
        return inviteExistingUser(existsUser, params, accountId);
      }
      else {
        return inviteNewUser(params, accountId);
      }
    }).then(function(params) {
      deferred.resolve(params);
    }).catch(function(error) {
      deferred.reject(error);
    });
  }, function(error) {
    deferred.reject(error);
  });

  return deferred.promise;
}

function canAddAccountManager(accountId) {
  let deferred = q.defer();

  validators.canAddAccountUsers(accountId, 'accountUser', 1).then(function() {
    deferred.resolve();
  },function(error) {
    deferred.reject(error);
  });

  return deferred.promise;
}

function findAccountManagers(accountId) {
  let deferred = q.defer();

  AccountUser.findAll({
    where: {
      AccountId: accountId,
      role: 'accountManager'
    }
  }).then(function(result) {
    deferred.resolve(result);
  }, function(error) {
    deferred.reject(filters.errors(error));
  });

  return deferred.promise;
}

function findAndRemoveAccountUser(id, accountId) {
  let deferred = q.defer();

  AccountUser.find({
    where: {
      id: id,
      owner: false
    },
    include: [{
      model: Account,
      where: { id: accountId }
    }]
  }).then(function(result) {
    if(result) {
      result.destroy().then(function() {
        deferred.resolve(MessagesUtil.accountManager.removed);
      }, function(error) {
        deferred.reject(filters.errors(error));
      });
    }
    else {
      deferred.reject(MessagesUtil.accountManager.notFoundOrOwner);
    }
  });

  return deferred.promise;
}

function updateAccountManager(data) {
  let deferred = q.defer();
  let params = prepareParams(data);

  AccountUser.update(params, { where: { id: data.id }, returning: true }).then(function(result) {
    if(result[0] == 1) {
      deferred.resolve({ message: MessagesUtil.accountManager.updated, accountManager: result[1][0] });
    }
    else {
      deferred.reject(MessagesUtil.accountManager.notFound);
    }
  }, function(error) {
    deferred.reject(filters.errors(error));
  });

  return deferred.promise;
}

//Helpers
function preValidate(user, accountId, email, errors) {
  let deferred = q.defer();
  if(!_.isEmpty(errors)) {
    errors = filters.errors(errors);
  }

  if(user.email == email) {
    errors.email = MessagesUtil.accountManager.error.selfInvite;
    deferred.resolve(errors);
  }
  else if(email) {
    AccountUser.findAll({
      include: [{
        model: User,
        where: { email: email }
      }],
      where: {
        UserId: { $ne: user.id },
        AccountId: accountId
      }
    }).then(function(accountUsers) {
      if(!_.isEmpty(accountUsers)) {
        errors.email = MessagesUtil.accountManager.error.alreadyInvited;
      }

      deferred.resolve(errors);
    }).catch(function(error) {
      errors = _.merge(errors, filters.errors(error));
      deferred.resolve(errors);
    });
  }
  else {
    deferred.resolve(errors);
  }

  return deferred.promise;
}

function inviteNewUser(params, accountId) {
  let deferred = q.defer();

  createAccountUser(params, null, 'new', accountId).then(function(data) {
    User.create(userParams(params.email)).then(function(newUser) {
      AccountUser.update({ UserId: newUser.id }, { where: { id: data.accountUserId } }).then(function() {
        data.userId = newUser.id;
        deferred.resolve(data);
      }, function(error) {
        deferred.reject(filters.errors(error));
      });
    }, function(error) {
      deferred.reject(filters.errors(error));
    });
  }, function(error) {
    deferred.reject(filters.errors(error));
  });

  return deferred.promise;
}

function inviteExistingUser(existsUser, params, accountId) {
  let deferred = q.defer();

  existsUser.getAccounts({ where: { id: accountId } }).then(function(results) {
    if(_.isEmpty(results)) {
      createAccountUser(params, existsUser.id, 'existing', accountId).then(function(params) {
        deferred.resolve(params);
      }, function(error) {
        deferred.reject(filters.errors(error));
      });
    }
    else {
      deferred.reject(MessagesUtil.accountManager.error.alreadyAccepted);
    }
  });

  return deferred.promise;
}

function createAccountUser(params, userId, type, accountId, cb) {
  let deferred = q.defer();
  adjustParamsForNewAccountUser(params, userId, accountId);

  AccountUser.create(params).then(function(newAccountUser){
    addToContactList(newAccountUser).then(function() {
      deferred.resolve(inviteParams(newAccountUser.id, accountId, userId, type));
    }, function(error) {
      deferred.reject(filters.errors(error));
    });
  }).catch(function(error) {
    deferred.reject(filters.errors(error));
  });

  return deferred.promise;
}

function addToContactList(accountUser) {
  let deferred = q.defer();

  models.ContactList.find({
    where: {
      role: accountUser.role,
      accountId: accountUser.AccountId
    }
  }).then(function(contactList) {
    let params = {
      userId: accountUser.UserId,
      accountUserId: accountUser.id,
      accountId: accountUser.AccountId,
      contactListId: contactList.id
    };

    models.ContactListUser.create(params).then(function() {
      deferred.resolve();
    },function(error) {
      deferred.reject(filters.errors(error));
    });
  });

  return deferred.promise;
}

function userParams(email) {
  return {
    email: email,
    password: crypto.randomBytes(16).toString('hex')
  };
}

function adjustParamsForNewAccountUser(params, userId, accountId) {
  params.status = 'invited';
  params.role = 'accountManager';
  params.AccountId = accountId;
  params.UserId = userId;
  return params;
}

function inviteParams(accountUserId, accountId, userId, type) {
  return { userId: userId, accountUserId: accountUserId, accountId: accountId, userType: type, role: 'accountManager' };
}

function prepareParams(body) {
  return _.pick(body, constants.safeAccountUserParams);
}
