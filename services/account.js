'use strict';

var MessagesUtil = require('./../util/messages');
var models = require('./../models');
var Account  = models.Account;
var filters = require('./../models/filters');
var contactListService  = require('./contactList');
var brandColourService  = require('./brandColour');
var subscriptionPreferencesCosnt  = require('../util/planConstants.js')
var _ = require('lodash');
var q = require('q');

function create(object, callback) {
  object.account = {};
  object.errors = object.errors || {};

  Account.create({ name: object.params.accountName, selectedPlanOnRegistration: object.params.selectedPlanOnRegistration }, { transaction: object.transaction }).then(function(result) {
    contactListService.createDefaultLists(result.id, object.transaction).then(function(contactLists) {
      brandColourService.createDefaultForAccount({ accountId: result.id, name: 'Default scheme', colours: {} }, object.transaction).then(function() {
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
  findWithSubscription: findWithSubscription
}
