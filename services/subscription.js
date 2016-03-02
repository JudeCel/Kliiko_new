'use strict';

var models = require('./../models');
var filters = require('./../models/filters');
var Subscription = models.Subscription;
var AccountUser = models.AccountUser;

var q = require('q');
var _ = require('lodash');
var async = require('async');
var config = require('config');
var chargebee = require('chargebee');

var chargebeeConfigs = config.get('chargebee');
chargebee.configure({
  site: chargebeeConfigs.site,
  api_key: chargebeeConfigs.api_key
});

const MESSAGES = {
  notFound: {
    subscription: 'No subscription found',
    accountUser: 'No account user found'
  },
  alreadyExists: 'Subscription already exists'
}

module.exports = {
  findSubscription: findSubscription,
  createSubscription: createSubscription
}

function findSubscription(accountId) {
  let deferred = q.defer();

  Subscription.find({ where: { accountId: accountId } }).then(function(subscription) {
    deferred.resolve(subscription);
  }).catch(function(error) {
    deferred.reject(filters.errors(error));
  });

  return deferred.promise;
}

function createSubscription(accountId, userId) {
  let deferred = q.defer();

  findSubscription(accountId).then(function(subscription) {
    if(subscription) {
      deferred.reject(MESSAGES.alreadyExists);
    }
    else {
      return AccountUser.find({ where: { AccountId: accountId, UserId: userId } });
    }
  }).then(function(accountUser) {
    if(accountUser) {
      return chargebeeSubCreate(chargebeeParams(accountUser));
    }
    else {
      deferred.reject(MESSAGES.notFound.accountUser);
    }
  }).then(function(chargebeeSub) {
    return Subscription.create(subscriptionParams(accountId, chargebeeSub));
  }).then(function(subscription) {
    deferred.resolve(subscription);
  }).catch(function(error) {
    deferred.reject(filters.errors(error));
  });

  return deferred.promise;
}

// Helpers
function chargebeeSubCreate(params) {
  let deferred = q.defer();

  chargebee.subscription.create(params).request(function(error, result) {
    if(error) {
      deferred.reject(error);
    }
    else {
      deferred.resolve(result.subscription);
    }
  });

  return deferred.promise;
}

function subscriptionParams(accountId, chargebeeSub) {
  return {
    accountId: accountId,
    planId: chargebeeSub.plan_id,
    subscriptionId: chargebeeSub.id
  }
}

function chargebeeParams(accountUser) {
  return {
    plan_id: 'Free',
    customer: {
      email: accountUser.email,
      first_name: accountUser.firstName,
      last_name: accountUser.lastName,
      phone: accountUser.mobile
    },
    billing_address: {
      first_name: accountUser.firstName,
      last_name: accountUser.lastName,
      line1: accountUser.postalAddress,
      city: accountUser.city,
      state: accountUser.state,
      zip: accountUser.zip,
      country: accountUser.country
    }
  }
}
