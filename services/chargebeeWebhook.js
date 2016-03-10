'use strict';
var q = require('q');

var subscriptionService = require('./subscription');

const CHARGEBEE_EVENTS = {
  subscription_cancelled: subscriptionService.cancelSubscription,
  subscription_renewed: subscriptionService.recurringSubscription
};

module.exports = {
  select: select
};

function select(type, params) {
  let deferred = q.defer();
  let hook = CHARGEBEE_EVENTS[type];

  if(hook) {
    hook(params.subscriptionId, params.eventId).then(function(result) {
      deferred.resolve(result);
    }, function(error) {
      deferred.reject(error);
    });
  }
  else {
    deferred.resolve();
  }

  return deferred.promise;
}
