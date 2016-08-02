'use strict';

var models = require('./../../models');
var filters = require('./../../models/filters');
var Subscription = models.Subscription;

var q = require('q');
var _ = require('lodash');

const MESSAGES = {
  error: {
    inactiveSubscription: "Your subscription is expired, please update your subscription plan.",
    noSubscription: "You don't have a subscription. Please purchase a plan.",
    account: 'Account not found'
  }
}

module.exports = {
  messages: MESSAGES,
  validate: validate
};

function validate(accountId) {
  let deferred = q.defer();

  models.Account.find({
    where: { id: accountId },
    include: [Subscription]
  }).then(function(account) {
    if(account) {
      if(account.admin) {
        deferred.resolve();
      }
      else if(account.Subscription) {
        if(account.Subscription.active) {
          deferred.resolve();
        }
        else {
          deferred.reject(MESSAGES.error.inactiveSubscription);
        }
      }
      else {
        deferred.reject(MESSAGES.error.noSubscription);
      }
    }
    else {
      deferred.reject(MESSAGES.error.account);
    }
  });

  return deferred.promise;
}
