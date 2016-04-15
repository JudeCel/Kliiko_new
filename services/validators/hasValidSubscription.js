'use strict';

var models = require('./../../models');
var filters = require('./../../models/filters');
var Subscription = models.Subscription;

var q = require('q');
var _ = require('lodash');

const MESSAGES = {
  error: {
    inactiveSubscription: "Your subscription is expired, please update your subscription plan.",
    noSubscription: "You don't have a subscription. Please purchase a plan."
  }
}

module.exports = {
  messages: MESSAGES,
  validate: validate
};

function validate(accountId) {
  let deferred = q.defer();

  Subscription.find({
    where: {
      accountId: accountId,
      active: true
    }
  }).then(function(subscription) {
    if(subscription){
      if(subscription.active){
        deferred.resolve();
      }else{
        deferred.reject(MESSAGES.error.inactiveSubscription);
      }
    }else{
      deferred.reject(MESSAGES.error.noSubscription);
    }
  }).catch(function(error) {
    deferred.reject(filters.errors(error));
  });

  return deferred.promise;
}
