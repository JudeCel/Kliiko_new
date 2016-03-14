'use strict';

require('./../lib/airbrake').handleExceptions();

var models = require('./../models');
var filters = require('./../models/filters');
var Subscription = models.Subscription;
var Account = models.Account;

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

}

module.exports = {
  messages: MESSAGES,
  getAllAddons: getAllAddons
}

function getAllAddons() {
  let deferred = q.defer();

  chargebee.addon.list({}).request(function(error, result){
    if(error){
      deferred.reject(error);
    }else{
      deferred.resolve(result);
    }
  });

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

  Subscription.find({
    where: {
      accountId: params.accountId
    }
  }).then(function(subscription) {
    params.subscriptionId = subscription.subscriptionId
    params.customerId = subscription.customerId

    chargebeeAddonCharge(params).then(function(result) {
      deferred.resolve(result);
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
    addon_quantity : params.addonQuantity
  }).request(function(error,result){
    if(error){
      deferred.reject(error);
    }else{
      preferenceParams(params.subscriptionId).then(function(dataParams) {
        params.preferenceData = dataParams;
        addSmsCreditsToAccountSubscription(params, addonInvoice).then(function(result) {

        }, function(error) {
          deferred.reject(error);
        })
      }, function(error) {
        deferred.reject(error);
      })
      // var invoice = result.invoice;
    }
  });

  return deferred.promise;
}

function addSmsCreditsToAccountSubscription(params, addonInvoice) {
  let deferred = q.defer();
  // let smsCount = params.preferenceData.paidSmsCount +
  //
  // params.preferenceData =

  models.SubscriptionPreference.update({
    data: params.preferenceData
  }, {
    where: {
      subscriptionId: params.subscriptionId
    },
    returning: true
  }).then(function(result) {

  }).catch(function(error) {
    deferred.reject(filters.errors(error));
  });

  return deferred.promise;
}

function preferenceParams(subscriptionId) {
  let deferred = q.defer();
  let preferenceDataParams = {}

  models.SubscriptionPreference.find({
    where{
      subscriptionId: subscriptionId
    }
  }).then(function(preference) {
    preferenceDataParams = preference.data;
    deferred.resolve(preferenceDataParams);
  }).catch(function(error) {
    deferred.reject(filters.errors(error));
  });

  return deferred.promise;
}
