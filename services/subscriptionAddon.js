'use strict';

// require('./../lib/airbrake').handleExceptions();

var MessagesUtil = require('./../util/messages');
var models = require('./../models');
var filters = require('./../models/filters');
var subscriptionValidator = require('./validators/subscription');
var Subscription = models.Subscription;
var Account = models.Account;

var q = require('q');
var _ = require('lodash');
var async = require('async');
var Bluebird = require('bluebird');
var chargebee = require('./../lib/chargebee').instance;

// We can get credit count when we call addon from chargebee system, there is unit field for addon.
// Right now I didn't do that extra call because we have only one addon.
const CREDIT_COUNT_PER_ADDON = 35;

module.exports = {
  messages: MessagesUtil.subscriptionAddon,
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
    let smsCount = subscription.SubscriptionPreference.data.planSmsCount + subscription.SubscriptionPreference.data.paidSmsCount
    deferred.resolve(smsCount);
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

  return new Bluebird((resolve, reject) => {
    subscriptionValidator.planAllowsToDoIt(params.accountId, 'canBuySms').then((subscription) => {
      if(!params.addon_quantity) {
        return reject(MessagesUtil.subscriptionAddon.missingQuantity);
      }
      params.subscriptionId = subscription.subscriptionId
      params.customerId = subscription.customerId
      params.id = subscription.id
      params.currentSmsCount = subscription.SubscriptionPreference.data.paidSmsCount;

      chargebeeAddonCharge(params).then((result) => {
        return addSmsCreditsToAccountSubscription(params, result.invoice)
      }).then((result) => {
        resolve({smsCretiCount: result, message: MessagesUtil.subscriptionAddon.successfulPurchase});
      }).catch((error) => {
        reject(error);
      });
    }).catch((error) => {
      reject({ planTooLow: true, message: filters.errors(error) });
    });
  });
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
      deferred.reject(error.message);
    }else{
      deferred.resolve(result.invoice);
    }
  });

  return deferred.promise;
}

function addSmsCreditsToAccountSubscription(params, addonInvoice) {
  let deferred = q.defer();
  let smsCount = calculateSmsCount(params.addon_quantity, params.currentSmsCount);

  models.SubscriptionPreference.find({
    where: { subscriptionId: params.id }
  }).then(function(result) {
    result.data.paidSmsCount = smsCount;
    return result.update({ data: result.data}, { returning: true });
  }).then(function(result) {
    deferred.resolve((result.data.planSmsCount + result.data.paidSmsCount));
  }).catch(function(error) {
    deferred.reject(filters.errors(error));
  })

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
