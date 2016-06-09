'use strict';

var models = require('./../../models');
var filters = require('./../../models/filters');
var subscriptionService = require('./../../services/subscription');
var userFixture = require('./user');
var subscriptionPlansFixture = require('./subscriptionPlans');

var q = require('q');
var _ = require('lodash');

module.exports = {
  createSubscription: createSubscription
}

function successProvider(params) {
  return function() {
    return {
      request: function(callback) {
        callback(null, {
          subscription: { id: params.id, plan_id: 'free_trial' },
          customer: { id: params.id }
        });
      }
    }
  }
}

var testData;
function createSubscription(accountId, userId) {
  let deferred = q.defer();
  if(accountId && userId){
    subscriptionPlansFixture.createPlans().then(function() {
      subscriptionService.createSubscription(accountId, userId, successProvider({ id: 'RandomUniqueId666' })).then(function(subscription) {
        deferred.resolve(subscription);
      }, function(error) {
        deferred.reject(error);
      });
    }, function(error) {
      deferred.reject(error);
    })
  }else{
    userFixture.createUserAndOwnerAccount().then(function(result) {
      testData = result;
      return subscriptionPlansFixture.createPlans();
    }).then(function(plans) {
      testData.subscriptionPlans = plans;
      return subscriptionService.createSubscription(testData.account.id, testData.user.id, successProvider({ id: 'RandomUniqueId666' }));
    }).then(function(subscription) {
      testData.subscription = subscription;
      deferred.resolve(testData);
    }).catch(function(error) {
      deferred.reject(error);
    });
  }

  return deferred.promise;
}
