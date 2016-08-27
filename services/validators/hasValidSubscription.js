'use strict';

var MessagesUtil = require('./../../util/messages');
var models = require('./../../models');
var filters = require('./../../models/filters');
var Subscription = models.Subscription;

var q = require('q');
var _ = require('lodash');

module.exports = {
  messages: MessagesUtil.validators.subscription,
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
          deferred.reject(MessagesUtil.validators.subscription.error.inactiveSubscription);
        }
      }
      else {
        deferred.reject(MessagesUtil.validators.subscription.error.noSubscription);
      }
    }
    else {
      deferred.reject(MessagesUtil.validators.subscription.error.account);
    }
  });

  return deferred.promise;
}
