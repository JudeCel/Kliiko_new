'use strict';

// require('./../lib/airbrake').handleExceptions();

var models = require('./../models');
var filters = require('./../models/filters');
var Subscription = models.Subscription;
var Account = models.Account;

var q = require('q');
var _ = require('lodash');
var async = require('async');
var chargebee = require('./../lib/chargebee').instance;

// We can get credit count when we call addon from chargebee system, there is unit field for addon.
// Right now I didn't do that extra call because we have only one addon.
const CREDIT_COUNT_PER_ADDON = 35;

const MESSAGES = {
  successfulPurchase: "You have sucessfully purchase additional sms credits."
}

module.exports = {
  messages: MESSAGES,
  getAllAddons: getAllAddons,
  creditCount: creditCount,
  chargeAddon: chargeAddon
}

function getAllAddons() {
  let deferred = q.defer();

  chargebee.addon.list({
    limit: 1,
    "status[is_not]" : "archived"
  }).request(function(error, result){
    if(error){
      deferred.reject(error);
    }else{
      deferred.resolve(result.list);
    }
  });

  return deferred.promise;
}

function creditCount(accountId) {
  let deferred = q.defer();

  Subscription.find({ where: { accountId: accountId }, include: [models.SubscriptionPreference] }).then(function(subscription) {
    deferred.resolve(subscription.SubscriptionPreference.data.paidSmsCount);
  }).catch(function(error) {
    deferred.reject(error);
  });;

  return deferred.promise;
}

// Example params for charging addon
// params = {
//   accountId: accountId,
//   addonId: addonId,
//   addonQuantity: addonQuantity,
//   subscriptionId: subscriptionId
// }

function chargeAddon(params) {
  let deferred = q.defer();

  Subscription.find({ where: { accountId: params.accountId }, include: [models.SubscriptionPreference] }).then(function(subscription) {
    params.subscriptionId = subscription.subscriptionId
    params.customerId = subscription.customerId
    params.id = subscription.id
    params.currentSmsCount = subscription.SubscriptionPreference.data.paidSmsCount;

    chargebeeAddonCharge(params).then(function(result) {
      addSmsCreditsToAccountSubscription(params, result.invoice).then(function(result) {
        deferred.resolve({smsCretiCount: result, message: MESSAGES.successfulPurchase});
      }, function(error) {
        deferred.reject(error);
      })

    }, function(error) {
      deferred.reject(error);
    })
  }).catch(function(error) {
    deferred.reject(filters.errors(error));
  });

  return deferred.promise;
}

// Helpers

function chargebeeAddonCharge(params) {
  let deferred = q.defer();

  chargebee.invoice.charge_addon({
    subscription_id : params.subscriptionId,
    addon_id : params.addonId,
    addon_quantity : params.addon_quantity
  }).request(function(error, result){
    if(error){
      deferred.reject(error);
    }else{
      deferred.resolve(result.invoice);
    }
  });

  return deferred.promise;
}

function addSmsCreditsToAccountSubscription(params, addonInvoice) {
  let deferred = q.defer();
  let smsCount = calculateSmsCount(params.addon_quantity, params.currentSmsCount);

  models.SubscriptionPreference.update({
    "data.paidSmsCount": smsCount
  }, {
    where: {
      subscriptionId: params.id
    },
    returning: true
  }).then(function(result) {
    deferred.resolve(smsCount);
  }).catch(function(error) {
    deferred.reject(filters.errors(error));
  });

  return deferred.promise;
}

function calculateSmsCount(qty, currentSmsCount) {
  return ((qty * CREDIT_COUNT_PER_ADDON) + currentSmsCount)
}

function findPreference(subscriptionId) {
  let deferred = q.defer();

  models.SubscriptionPreference.find({
    where : {
      subscriptionId: subscriptionId
    },

  }).then(function(subscriptionPreference) {
    deferred.resolve(subscriptionPreference);
  }).catch(function(error) {
    deferred.reject(error);
  });

  return deferred.promise;
}
