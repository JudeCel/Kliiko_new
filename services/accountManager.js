'use strict';

var MessagesUtil = require('./../util/messages');
var validators = require('./../services/validators');
var constants = require('../util/constants');
var models = require('./../models');
var filters = require('./../models/filters');
var AccountUser = models.AccountUser;
var User = models.User;
var Account = models.Account;
var AccountUserService = require('./accountUser');

var async = require('async');
var _ = require('lodash');
var crypto = require('crypto');
var q = require('q');
let Bluebird = require('bluebird');

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

  let flow = [
    (user, params, accountId) => {
      return canAddAccountManager(accountId);
    },
    (user, params, accountId) => {
      return new Bluebird((resolve, reject) => {
        AccountUser.build(AccountUserService.validateParams(params)).validate().then((validateErrors) => {
          delete params.role;
          resolve(preValidate(user, accountId, params.email, (validateErrors || {})))
        }, (error) => {
          reject(error);
        });
      })
    },
    (user, params, accountId) => {
      return addAccountUser(params, accountId);
    },
  ]

  return new Bluebird((resolve, reject) => {
    Bluebird.map(flow, (step) => {
      return step(user, params, accountId);
    }).then((result) => {
      resolve(_.last(result));
    }, (error) => {
      reject(error);
    })
  })
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
  if(!_.isEmpty(errors)) {
    errors = filters.errors(errors);
  }

  return new Bluebird((resolve, reject) => {
    if(user.email == email) {
      errors.email = MessagesUtil.accountManager.error.selfInvite;
      reject(errors);
    } else if (email) {
      AccountUser.findAll({
        where: { AccountId: accountId, role: "accountManager", email: { ilike: email }  }
      }).then(function(accountUsers) {
        if(_.isEmpty(accountUsers)) {
          resolve();
        }else{
          errors.email = MessagesUtil.accountManager.error.alreadyInvited;
          reject(errors);
        }
      }).catch(function(error) {
        errors = _.merge(errors, filters.errors(error));
        reject(errors);
      });
    } else {
      reject(errors);
    }
  })
}

function addAccountUser(params, accountId) {
  return new Bluebird((resolve, reject) => {
    createAccountUser(params, accountId).then((data) => {
      resolve(data);
    }, (error) => {
      reject(filters.errors(error));
    });
  })
}

function updateAccountUser(accountId, accountUserId) {
  let deferred = q.defer();

  AccountUser.update({ role: 'accountManager' }, { where: { id: accountUserId } }).then(function() {
    deferred.resolve(inviteParams(accountUserId, accountId));
  }).catch(function(error) {
    deferred.reject(filters.errors(error));
  });

  return deferred.promise;
}

function createAccountUser(params, accountId) {
  let deferred = q.defer();
  adjustParamsForNewAccountUser(params, accountId);

  AccountUser.create(params).then(function(newAccountUser){
    addToContactList(newAccountUser).then(function() {
      deferred.resolve(inviteParams(newAccountUser.id, accountId));
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

function adjustParamsForNewAccountUser(params, accountId) {
  params.status = 'invited';
  params.role = 'accountManager';
  params.AccountId = accountId;
  return params;
}

function inviteParams(accountUserId, accountId) {
  return {accountUserId: accountUserId, accountId: accountId, role: 'accountManager' };
}

function prepareParams(body) {
  return _.pick(body, constants.safeAccountUserParams);
}
