'use strict';
var models = require('./../../models');
var subscriptionService = require('./../../services/subscription');
var planConstants = require('./../../util/planConstants');
var _ = require('lodash');
var async = require('async');
var q = require('q');
var filters = require('./../../models/filters');

function createPlans() {
  let deferred = q.defer();

  subscriptionService.getAllPlans().then(function(plans) {
    async.each(plans, function(result, callback) {
      create(result.plan).then(function(result) {
        callback();
      }, function(error) {
        callback(error);
      });
    }, function(error, _result) {
      if(error) {
        deferred.reject(error);
      }
      else {
        models.SubscriptionPlan.findAll().then(function(result) {
          deferred.resolve(result);
        }, function(error) {
          deferred.reject(error);
        })
      }
    });
  }, function(error) {
    deferred.reject(error);
  });

  return deferred.promise;
}

function create(plan) {
  const deferred = q.defer();
  const preferenceName = planConstants.preferenceName(plan.id);
  const params = planConstants[preferenceName];
  if (params) {
    params.preferenceName = preferenceName;
    params.chargebeePlanId = plan.id;

    models.SubscriptionPlan.findOne({ where: { preferenceName: params.preferenceName } })
      .then(function (plan) {
        if (plan) {
          return plan;
        }

        return models.SubscriptionPlan.create(params);
      })
      .then(function (result) {
        deferred.resolve(result);
      })
      .catch(function (error) {
        deferred.reject(filters.errors(error));
      });
  } else {
    deferred.reject('Can\'t find plan in constants!');
  }

  return deferred.promise;
}

module.exports = {
  createPlans: createPlans
}
