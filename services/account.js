'use strict';

var MessagesUtil = require('./../util/messages');
var Constants = require('./../util/constants');
var models = require('./../models');
var Account  = models.Account;
var filters = require('./../models/filters');
var contactListService  = require('./contactList');
var brandColourService  = require('./brandColour');
var topicsService  = require('./topics');
var subscriptionPreferencesCosnt  = require('../util/planConstants.js')
var accountUserService = require('./accountUser');
var async = require('async');
var _ = require('lodash');
var q = require('q');


function createNewAccountIfNotExists(params, userId, isAdmin) {
  let deferred = q.defer();

  if (!params.accountName || params.accountName == '') {
    deferred.reject(filters.errors(MessagesUtil.account.empty));
  } else {
    models.AccountUser.count({ where: { UserId: userId, role: "accountManager", owner: true } }).then(function(ownAccounts) {
      if (ownAccounts >= Constants.maxAccountsAmount) {
        deferred.reject(filters.errors(MessagesUtil.account.accountExists));
      } else {
        models.AccountUser.find({ where: { UserId: userId, role: { $in: ["facilitator", "accountManager"] } } }).then(function(result) {
          createNewAccount(params, userId, !result, isAdmin).then(function(createResult) {
            deferred.resolve(createResult);
          }, function(error) {
            deferred.reject(error);
          });
        }, function(error) {
          deferred.reject(error);
        });
      }
    }, function(error) {
      deferred.reject(error);
    });
  }

  return deferred.promise;
}

function createNewAccount(params, userId, freeTrial, isAdmin) {
  let deferred = q.defer();
  let transactionPool = models.sequelize.transactionPool;
  let tiket = transactionPool.getTiket();
  transactionPool.once(tiket, () => {
    let createNewAccountFunctionList = [
      function (cb) {
        models.sequelize.transaction().then(function(t) {
          models.User.find({
            where: { id: userId },
            include: [models.AccountUser]
          }).then(function(result) {

            let createParams = getCreateNewAccountParams(params.accountName, result.email, freeTrial, isAdmin);

            models.AccountUser.count({
              where: {
               email: result.email,
               role: "accountManager",
               owner: true
              }
            }).then(function(count) {
              if(count > 0) {
                createParams.selectedPlanOnRegistration = 'free_account';
              }

              if (result.AccountUsers[0]) {
                createParams.firstName = result.AccountUsers[0].firstName;
                createParams.lastName = result.AccountUsers[0].lastName;
                createParams.gender = result.AccountUsers[0].gender;
              }

              cb(null, { params: createParams, user: {id: userId}, transaction: t, errors: {} });
            });
          }, function(error) {
            cb(null, { params: params, transaction: t, errors: filters.errors(error) })
          });
        });
      },
      create,
      accountUserService.createAccountManager,
    ];

    async.waterfall(createNewAccountFunctionList, function(_error, object) {
      if (_.isEmpty(object.errors)) {
        object.transaction.commit().then(function() {
          transactionPool.emit(transactionPool.CONSTANTS.endTransaction, tiket);
          deferred.resolve({ data: object.account, message: MessagesUtil.account.created });
        });
      } else {
        object.transaction.rollback().then(function() {
          transactionPool.emit(transactionPool.CONSTANTS.endTransaction, tiket);
          deferred.reject(object.errors);
        });
      }
    });

  })
  transactionPool.once(transactionPool.timeoutEvent(tiket), () => {
    callback("Server Timeoute");
  });

  transactionPool.emit(transactionPool.CONSTANTS.nextTick);

  return deferred.promise;
}

function getCreateNewAccountParams(accountName, email, freeTrial, isAdmin) {
  let res = {
    accountName: accountName,
    firstName: accountName,
    gender: '',
    lastName: accountName,
    email: email,
    active: false,
    selectedPlanOnRegistration: freeTrial ? 'free_trial' : null
  };

  if (isAdmin) {
    res.role = 'admin';
    res.selectedPlanOnRegistration = null;
  }

  return res;
}

function addFreeAccount(params) {

  models.AccountUser.count({
    where: {
     email: params.email,
     role: "accountManager",
     owner: true
    }
  }).then(function(count) {
    console.log("@#@%&^%^$%$^%#^%$&^%^$^%^%$^%^&$$&^%$&^%&^$&$&$");
    console.log(count > 1);
    console.log("@#@%&^%^$%$^%#^%$&^%^$^%^%$^%^&$$&^%$&^%&^$&$&$");
    return count > 1;
  });
}

function create(object, callback) {
  object.account = {};
  object.errors = object.errors || {};

  Account.create({
    name: object.params.accountName,
    selectedPlanOnRegistration: object.params.selectedPlanOnRegistration,
    admin: object.params.role == "admin"
  }, { transaction: object.transaction }).then(function(result) {
    contactListService.createDefaultLists(result.id, object.transaction).then(function(contactLists) {
      brandColourService.createDefaultForAccount({ accountId: result.id, type: 'focus', name: 'Default Focus Scheme', colours: {} }, object.transaction).then(function() {
        brandColourService.createDefaultForAccount({ accountId: result.id, type: 'forum', name: 'Default Forum Scheme', colours: {} }, object.transaction).then(function() {
          topicsService.createDefaultForAccount({ accountId: result.id, name: 'Getting Started', boardMessage: Constants.defaultTopic.billboardText }, object.transaction).then(function() {
            object.account = result;
            object.contactLists = contactLists.results;
            callback(null, object);
          }, function(error) {
            _.merge(object.errors, filters.errors(error));
            callback(null, object);
          });
        }, function(error) {
          _.merge(object.errors, filters.errors(error));
          callback(null, object);
        });
      }, function(error) {
        _.merge(object.errors, filters.errors(error));
        callback(null, object);
      });
    }, function(error) {
      _.merge(object.errors, filters.errors(error));
      callback(null, object);
    });
  }, function(error) {
    _.merge(object.errors, filters.errors(error));
    callback(null, object);
  });
}

function updateInstance(account, params, callback) {
  account.update({ name: params.accountName }).then(function(result) {
    callback(null, true);
  }).catch(function(error) {
    callback(filters.errors(error));
  });
}

function findWithSubscription(accountId) {
  let deferred = q.defer();

  Account.find({
    where: {
      id: accountId,
    },
    include: [{model: models.Subscription, include: [models.SubscriptionPreference]}]
  }).then(function(result) {
    if (result) {
      deferred.resolve(mapSubscriptionData(result));
    }else{
      deferred.reject(MessagesUtil.account.notFound);
    }
  }, function(error) {
    deferred.reject(error);
  });

  return deferred.promise;
}
function mapSubscriptionData(result) {
  let account = _.pick(result, ['id', 'admin', 'subdomain', 'name']);

  if (result.admin) {
    let planKeys = subscriptionPreferencesCosnt.free_trial;
    account.permissions = {};

    _.map(planKeys, (value, key) => {
      if (_.isBoolean(value)) {
        account.permissions[key] = true;
      }
      if (_.isInteger(value)) {
        account.permissions[key] = -1;
      }
    })
  }

  if (result.Subscription) {
    account.Subscription = _.pick(result.Subscription, ['id', 'accountId','subscriptionPlanId','planId', 'customerId', 'lastWebhookId', 'subscriptionId','active']);
    account.permissions = result.Subscription.SubscriptionPreference.dataValues.data;
  }

  return account;
}

module.exports = {
  create: create,
  updateInstance: updateInstance,
  findWithSubscription: findWithSubscription,
  createNewAccount: createNewAccount,
  createNewAccountIfNotExists: createNewAccountIfNotExists
}
