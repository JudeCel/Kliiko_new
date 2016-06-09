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

function select(params) {
  let deferred = q.defer();
  let hook = CHARGEBEE_EVENTS[params.event_type];

  if(hook) {
    hook(params.content.subscription.id, params.id).then(function(result) {
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
