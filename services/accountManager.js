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
          resolve(preValidate(user, accountId, params.email, (validateErrors || {})))
        }, (error) => {
          reject(filters.errors(error));
        });
      })
    },
    (user, params, accountId) => {
      return addAccountUser(params, accountId);
    },
  ]

  return new Bluebird((resolve, reject) => {
    Bluebird.mapSeries(flow, (step) => {
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
      role: {$in: ['accountManager', 'admin']}
    }
  }).then((result) => {
    deferred.resolve(parseAccuntManagers(result) );
  }, (error) => {
    deferred.reject(filters.errors(error));
  });

  return deferred.promise;
}

function parseAccuntManagers(list){
  return list.map((au) => {
      au.dataValues.admin = (au.role == 'admin');
      return au;
    });
}

function findAndRemoveAccountUser(id, accountId) {
  let deferred = q.defer();
  AccountUserService.deleteOrRecalculate(id, null, 'accountManager').then(() => {
    deferred.resolve(MessagesUtil.accountManager.removed);
  }, (error) => {
    deferred.reject(filters.errors(error));
  })

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
  return new Bluebird((resolve, reject) => {
    params = adjustParamsForNewAccountUser(params, accountId);
    AccountUser.find({
      where: { AccountId: accountId, email: { ilike: params.email }  }
    }).then((accountUser) => {
      if (accountUser) {
        AccountUserService.deleteOrRecalculate(accountUser.id, 'accountManager', null ).then(() => {
          addToContactList(accountUser, params.role).then(() => {
            resolve(inviteParams(accountUser.id, accountId));
          }, function(error) {
            reject(filters.errors(error));
          });
        }, (error) => {
          reject(error);
        })
      } else {
        AccountUser.create(params).then((newAccountUser) =>{
          addToContactList(newAccountUser).then(() => {
            resolve(inviteParams(newAccountUser.id, accountId));
          }, function(error) {
            reject(filters.errors(error));
          });
        }).catch(function(error) {
          reject(filters.errors(error));
        });
      }
    })
  });
}

function addToContactList(accountUser, role) {
 return new Bluebird((resolve, reject) => {
    models.ContactList.find({
      where: {
        role: (role || accountUser.role),
        accountId: accountUser.AccountId
      },
      include: [{model: models.ContactListUser, where: {
        accountUserId: accountUser.id},
        required: false
      }]
    }).then((contactList) => {
      if (_.isEmpty(contactList.ContactListUsers)) {
        let params = {
          accountUserId: accountUser.id,
          accountId: accountUser.AccountId,
          contactListId: contactList.id
        };
        models.ContactListUser.create(params).then(()=> {
          resolve();
        },function(error) {
          reject(filters.errors(error));
        });
      } else {
        resolve();
      }
    });
 })
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
