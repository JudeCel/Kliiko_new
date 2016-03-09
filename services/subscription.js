'use strict';

require('./../lib/airbrake').handleExceptions();

var models = require('./../models');
var filters = require('./../models/filters');
var Subscription = models.Subscription;
var AccountUser = models.AccountUser;
var SubscriptionPlan = models.SubscriptionPlan;

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
  notFound: {
    subscription: 'No subscription found',
    accountUser: 'No account user found',
    subscriptionPlan: 'No plan found'
  },
  validation: {
    session: "You have to many sessions",
    survey: "You have to many surveys",
    contactList: "You have to many contact lists",
  },
  alreadyExists: 'Subscription already exists',
  cantSwitchPlan: "Can't switch plan"
}

module.exports = {
  messages: MESSAGES,
  findSubscription: findSubscription,
  createPortalSession: createPortalSession,
  createSubscription: createSubscription,
  updateSubscription: updateSubscription,
  cancelSubscription: cancelSubscription,
  getAllPlans: getAllPlans
}

function getAllPlans() {
  let deferred = q.defer();

  chargebee.plan.list({}).request(function(error, result){
    if(error){
      deferred.reject(error);
    }else{
      deferred.resolve(result.list);
    }
  });

  return deferred.promise;
}

function findSubscription(accountId) {
  let deferred = q.defer();

  Subscription.find({ where: { accountId: accountId }, include: [SubscriptionPlan] }).then(function(subscription) {
    deferred.resolve(subscription);
  }).catch(function(error) {
    deferred.reject(error);
  });

  return deferred.promise;
}

function findSubscriptionByChargebeeId(subscriptionId) {
  let deferred = q.defer();

  Subscription.find({ where: { subscriptionId: subscriptionId }, include: [SubscriptionPlan] }).then(function(subscription) {
    if(subscription) {
      deferred.resolve(subscription);
    }
    else {
      deferred.reject(MESSAGES.notFound.subscription);
    }
  }).catch(function(error) {
    deferred.reject(error);
  });

  return deferred.promise;
}

function createSubscription(accountId, userId, provider) {
  let deferred = q.defer();

  findSubscription(accountId).then(function(subscription) {
    if(subscription) {
      deferred.reject(MESSAGES.alreadyExists);
    }
    else {
      return AccountUser.find({ where: { AccountId: accountId, UserId: userId } });
    }
  }).then(function(accountUser) {
    if(accountUser) {
      return chargebeeSubCreate(chargebeeSubParams(accountUser), provider);
    }
    else {
      deferred.reject(MESSAGES.notFound.accountUser);
    }
  }).then(function(chargebeeSub) {
    return SubscriptionPlan.find({
      chargebeePlanId: chargebeeSub.subscription.plan_id
    }).then(function(plan) {
      if(plan){
        return models.sequelize.transaction(function (t) {
          return Subscription.create(subscriptionParams(accountId, chargebeeSub, plan.id), {transaction: t}).then(function(subscription) {
            return models.SubscriptionPreference.create({subscriptionId: subscription.id}, {transaction: t}).then(function() {
              return subscription;
            }, function(error) {
              throw error;
            });
          });
        });
      }else{
        deferred.reject(MESSAGES.notFound.subscriptionPlan);
      }
    });
  }).then(function(subscription) {
    deferred.resolve(subscription);
  }).catch(function(error) {
    deferred.reject(filters.errors(error));
  });

  return deferred.promise;
}

function createPortalSession(accountId, callbackUrl, provider) {
  let deferred = q.defer();

  findSubscription(accountId).then(function(subscription) {
    if(subscription) {
      return chargebeePortalCreate(chargebeePortalParams(subscription, callbackUrl), provider);
    }
    else {
      deferred.reject(MESSAGES.notFound.subscription);
    }
  }).then(function(chargebeePortal) {
    deferred.resolve(chargebeePortal.access_url);
  }).catch(function(error) {
    deferred.reject(filters.errors(error));
  });

  return deferred.promise;
}

function updateSubscription(accountId, newPlanId, provider) {
  let deferred = q.defer();

  findSubscription(accountId).then(function(subscription) {
    if(subscription) {
      return subscription;
    }
    else {
      deferred.reject(MESSAGES.notFound.subscription);
    }
  }).then(function(subscription) {
    return SubscriptionPlan.find({
      where: {
        id: newPlanId
      }
    }).then(function(plan) {
      if(plan){
        return {subscription: subscription, currentPlan: subscription.SubscriptionPlan, newPlan: plan}
      }else{
        deferred.reject(MESSAGES.notFound.subscriptionPlan);
      }
    });
  }).then(function(result) {
    canSwitchPlan(accountId, result.currentPlan, result.newPlan).then(function() {
      chargebeeSubUpdate(result.subscription.subscriptionId, {plan_id: result.newPlan.chargebeePlanId}, provider).then(function(updatedSub) {
        result.subscription.update({planId: updatedSub.plan_id}, {returning: true}).then(function(result) {
          deferred.resolve(result);
        }, function(error) {
          deferred.reject(filters.errors(error));
        });
      }, function(error) {
        deferred.reject(error);
      });
    }, function(error) {
      deferred.reject(error);
    });
  }).catch(function(error) {
    deferred.reject(error);
  });

  return deferred.promise;
}

function cancelSubscription(subscriptionId, eventId, callback) {
  let deferred = q.defer();

  findSubscriptionByChargebeeId(subscriptionId).then(function(subscription) {
    subscription.update({ active: false, lastWebhookId: eventId }, { returning: true }).then(function(subscription) {
      disableSubDependencies(subscription.accountId, callback);
      deferred.resolve(subscription);
    }, function(error) {
      deferred.reject(filters.errors(error));
    });
  }, function(error) {
    deferred.reject(error);
  });

  return deferred.promise;
}

// Helpers
function chargebeePortalCreate(params, provider) {
  let deferred = q.defer();

  if(!provider) {
    provider = chargebee.portal_session.create;
  }

  provider(params).request(function(error, result) {
    if(error) {
      deferred.reject(error);
    }
    else {
      deferred.resolve(result.portal_session);
    }
  });

  return deferred.promise;
}

function chargebeeSubUpdate(subscriptionId, params, provider) {
  let deferred = q.defer();

  if(!provider) {
    provider = chargebee.subscription.update;
  }

  provider(subscriptionId, params).request(function(error, result) {
    if(error) {
      deferred.reject(error);
    }
    else {
      deferred.resolve(result.subscription);
    }
  });

  return deferred.promise;
}

function chargebeeSubCreate(params, provider) {
  let deferred = q.defer();

  if(!provider) {
    provider = chargebee.subscription.create;
  }

  provider(params).request(function(error, result) {
    if(error) {
      deferred.reject(error);
    }
    else {
      deferred.resolve(result);
    }
  });

  return deferred.promise;
}

function subscriptionParams(accountId, chargebeeSub, subscriptionPlanId) {
  return {
    accountId: accountId,
    planId: chargebeeSub.subscription.plan_id,
    subscriptionId: chargebeeSub.subscription.id,
    customerId: chargebeeSub.customer.id,
    subscriptionPlanId: subscriptionPlanId
  }
}

function chargebeePortalParams(subscription, callbackUrl) {
  return {
    redirect_url: callbackUrl,
    customer: { id: subscription.customerId }
  }
}

function chargebeeSubParams(accountUser) {
  return {
    plan_id: 'Free',
    customer: {
      email: accountUser.email,
      first_name: accountUser.firstName,
      last_name: accountUser.lastName,
      phone: accountUser.mobile
    },
    billing_address: {
      first_name: accountUser.firstName,
      last_name: accountUser.lastName,
      line1: accountUser.postalAddress,
      city: accountUser.city,
      state: accountUser.state,
      zip: accountUser.zip,
      country: accountUser.country
    }
  }
}

function parallelFunc(promise) {
  return function(cb) {
    promise.then(function() {
      cb();
    });
  }
}

function disableSubDependencies(accountId, callback) {
  let arrayFunctions = [
    parallelFunc(models.Session.update({ active: false }, { where: { accountId: accountId } })),
    parallelFunc(models.Survey.update({ closed: true }, { where: { accountId: accountId } }))
  ];

  async.parallel(arrayFunctions, function(error, _result) {
    if(callback) {
      callback(error);
    }
  });
}

// Validators

function canSwitchPlan(accountId, currentPlan, newPlan){
  let deferred = q.defer();

  if(currentPlan.priority > newPlan.priority){
    let functionArray = [
      validateSessionCount(accountId, newPlan),
      validateSurveyCount(accountId, newPlan),
      validateContactListCount(accountId, newPlan)
    ]
    async.waterfall(functionArray, function(error, errorMessages) {
      if(error){
        deferred.reject(error);
      }else{
        if(_.isEmpty(errorMessages)){
          deferred.resolve();
        }else{
          deferred.reject(errorMessages);
        }
      }
    });
  }else if(currentPlan.priority < newPlan.priority){
    deferred.resolve();
  }else{
    deferred.reject(MESSAGES.cantSwitchPlan);
  }

  return deferred.promise;
}

function validateSessionCount(accountId, newPlan) {
  return function(cb) {
    models.Session.count({
      where: {
        accountId: accountId
      }
    }).then(function(c) {
      if(newPlan.sessionCount < c){
        cb(null, {session: MESSAGES.validation.session});
      }else{
        cb(null, {});
      }
    }, function(error) {
      cb(error);
    });
  }
}

function validateSurveyCount(accountId, newPlan) {
  return function(errors, cb) {
    models.Survey.count({
      where: {
        accountId: accountId
      }
    }).then(function(c) {
      errors = errors || {};
      if(newPlan.surveyCount < c){
        errors.survey = MESSAGES.validation.survey;
      }

      cb(null, errors);
    }, function(error) {
      cb(error);
    });
  }
}

function validateContactListCount(accountId, newPlan) {
  return function(errors, cb) {
    models.ContactList.count({
      where: {
        accountId: accountId
      }
    }).then(function(c) {
      errors = errors || {};
      if(newPlan.contactListCount < c){
        errors.contactList = MESSAGES.validation.contactList;
      }

      cb(null, errors);
    }, function(error) {
      cb(error);
    });
  }
}
