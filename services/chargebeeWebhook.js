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
  console.log("!!!!!!!!!!!!!!! services/chargebeeWebhook.js  select");
  console.log(params);

  let deferred = q.defer();
  let hook = CHARGEBEE_EVENTS[params.event_type];

  console.log(hook);
  console.log("!!!!!!!!!!!!!!! services/chargebeeWebhook.js  select");

  if(hook) {
    hook(params.content.subscription.id, params.id, params.provider).then(function() {
      deferred.resolve();
    }, function(error) {
      deferred.reject(error);
    });
  }
  else {
    deferred.resolve();
  }

  return deferred.promise;
}
