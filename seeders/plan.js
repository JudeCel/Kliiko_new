'use strict';
var models = require('./../models');
var subscriptionService = require('./../services/subscription');
var planConstants = require('./../util/planConstants');
var _ = require('lodash');
var async = require('async');
var q = require('q');
var filters = require('./../models/filters');

function createPlans() {
  subscriptionService.getAllPlans().then(function(plans) {
    async.each(plans, function(result, callback) {
      create(result.plan).then(function(result) {
        callback();
      }, function(error) {
        callback(error);
      });
    }, function(error, _result) {
      if(error) {
        planFailed(error);
      }
      else {
        console.log('Subscription Plan created!');
        process.exit();
      }
    });
  }, function(error) {
    planFailed(error);
  });
}

function planFailed(error) {
  console.log('Subscription Plan creation failed:');
  console.log(error);
  process.exit();
}

function create(plan) {
  let deferred = q.defer();
  let params = planConstants[plan.id];
  if(params){
    params.chargebeePlanId = plan.id;

    models.SubscriptionPlan.create(params).then(function(result) {
      deferred.resolve(result);
    }).catch(function(error) {
      deferred.reject(filters.errors(error));
    });
  }else {
    deferred.reject("Can't find plan in constants!");
  }

  return deferred.promise;
}

createPlans();
