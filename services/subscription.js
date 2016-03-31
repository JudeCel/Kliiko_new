'use strict';

var models = require('./../models');
var filters = require('./../models/filters');
var airbrake = require('./../lib/airbrake').instance;
var Subscription = models.Subscription;
var AccountUser = models.AccountUser;
var SubscriptionPlan = models.SubscriptionPlan;
var SubscriptionPreference = models.SubscriptionPreference;

var q = require('q');
var _ = require('lodash');
var async = require('async');
var config = require('config');
var chargebee = require('chargebee');
var planConstants = require('./../util/planConstants');
var chargebeeConfigs = config.get('chargebee');
chargebee.configure({
  site: chargebeeConfigs.site,
  api_key: chargebeeConfigs.api_key
});

const MESSAGES = {
  notFound: {
    subscription: 'No subscription found',
    accountUser: 'No account user found',
    subscriptionPlan: 'No plan found',
    account: "No account found."
  },
  validation: {
    session: "You have to many sessions",
    survey: "You have to many surveys",
    contactList: "You have to many contact lists",
  },
  alreadyExists: 'Subscription already exists',
  cantSwitchPlan: "Can't switch to current plan"
}

module.exports = {
  messages: MESSAGES,
  findSubscription: findSubscription,
  findSubscriptionByChargebeeId: findSubscriptionByChargebeeId,
  createPortalSession: createPortalSession,
  createSubscription: createSubscription,
  updateSubscription: updateSubscription,
  cancelSubscription: cancelSubscription,
  recurringSubscription: recurringSubscription,
  getAllPlans: getAllPlans,
  retrievCheckoutAndUpdateSub: retrievCheckoutAndUpdateSub
}

function getAllPlans(accountId) {
  let deferred = q.defer();

  chargebee.plan.list({}).request(function(error, result){
    if(error){
      deferred.reject(error);
    }else{
      if(accountId){
        findSubscription(accountId).then(function(currentSub) {
          addPlanEstimateChargeAndConstants(result.list, accountId).then(function(planWithConstsAndEstimates) {
            deferred.resolve({currentPlan: currentSub.SubscriptionPlan, plans: planWithConstsAndEstimates});
          })
        }, function(error) {
          deferred.reject(filters.errors(error));
        })
      }else{
        deferred.resolve(result.list)
      }
    }
  });

  return deferred.promise;
}

function addPlanEstimateChargeAndConstants(plans, accountId) {
  let deferred = q.defer();
  let plansWithAllInfo = [];

  findSubscription(accountId).then(function(accountSubscription) {
    async.each(plans, function(plan, callback) {
      if(plan.plan.id == accountSubscription.SubscriptionPlan.chargebeePlanId && plan.plan.id != "Free"){
        plan.additionalParams = planConstants[plan.plan.id];
        plansWithAllInfo.push(plan);
        callback();
      }else if(plan.plan.id != accountSubscription.SubscriptionPlan.chargebeePlanId && plan.plan.id != "Free"){
        getEstimateCharge(plan, accountSubscription).then(function(planWithEstimate) {
          planWithEstimate.additionalParams = planConstants[planWithEstimate.plan.id];
          plansWithAllInfo.push(planWithEstimate);
          callback();
        }, function(error) {
          callback(error);
        })
      }else{
        callback();
      }
    }, function(error, _result) {
      if(error){
        deferred.reject(error);
      }else {
        deferred.resolve(plansWithAllInfo);
      }
    });
  }, function(error) {
    deferred.reject(MESSAGES.notFound.account);
  })

  return deferred.promise;
}

function getEstimateCharge(plan, accountSubscription) {
  let deferred = q.defer();

  chargebee.estimate.update_subscription({
    subscription: {
      id: accountSubscription.subscriptionId,
      plan_id: plan.plan.id
    }
  }).request(function(error ,result){
    if(error){
      plan.chargeEstimate = error;
      deferred.resolve(plan);
    }else{
      plan.chargeEstimate = result.estimate;
      deferred.resolve(plan);
    }
  });

  return deferred.promise;
}

function findSubscription(accountId) {
  let deferred = q.defer();

  Subscription.find({ where: { accountId: accountId }, include: [SubscriptionPlan, SubscriptionPreference] }).then(function(subscription) {
    deferred.resolve(subscription);
  }).catch(function(error) {
    deferred.reject(error);
  });

  return deferred.promise;
}

function findSubscriptionByChargebeeId(subscriptionId) {
  let deferred = q.defer();

  Subscription.find({ where: { subscriptionId: subscriptionId }, include: [SubscriptionPlan, SubscriptionPreference] }).then(function(subscription) {
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
            return SubscriptionPreference.create({subscriptionId: subscription.id, data: planConstants[plan.chargebeePlanId]}, {transaction: t}).then(function() {
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

function gatherInformation(accountId, newPlanId) {
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
        chargebeePlanId: newPlanId
      }
    }).then(function(plan) {
      if(plan){
        return {subscription: subscription, currentPlan: subscription.SubscriptionPlan, newPlan: plan}
      }else{
        deferred.reject(MESSAGES.notFound.subscriptionPlan);
      }
    });
  }).then(function(result) {
    deferred.resolve(result);
  }).catch(function(error) {
    deferred.reject(error);
  });

  return deferred.promise;
}

function updateSubscription(accountId, newPlanId, provider) {
  let deferred = q.defer();

  gatherInformation(accountId, newPlanId).then(function(result) {
    canSwitchPlan(accountId, result.currentPlan, result.newPlan).then(function() {
      accountHasValidCeditCard(result.subscription.subscriptionId).then(function(creditCardStatus){
        if(creditCardStatus == "valid"){
          chargebeeSubUpdate(chargebeePassParams(result), provider).then(function(chargebeSubscription) {
            update(chargebeePassParams(result), provider).then(function(result) {
              deferred.resolve(result);
            }, function(error) {
              deferred.reject(error);
            })
          }, function(error) {
            deferred.reject(error);
          })
        }else{
          chargebeeSubUpdateViaCheckout(chargebeePassParams(result, provider)).then(function(result) {
            deferred.resolve({result: result, redirect: true});
          }, function(error) {
            deferred.reject(error);
          })
        }
      }, function(error) {
        deferred.reject(error);
      })
    }, function(error) {
      deferred.reject(error);
    });
  }, function(error) {
    deferred.reject(error);
  })

  return deferred.promise;
}

function retrievCheckoutAndUpdateSub(hostedPageId) {
  let deferred = q.defer();

  chargebee.hosted_page.retrieve(hostedPageId).request(function(error, result){
    if(error){
      deferred.reject(error);
    }else{
      let passThruContent = JSON.parse(result.hosted_page.pass_thru_content)
      update(passThruContent).then(function(result) {
        deferred.resolve(result);
      }, function(error) {
        deferred.reject(filters.errors(error));
      })
    }
  });

  return deferred.promise;
}

function update(passThruContent){
  let deferred = q.defer();

  findSubscriptionByChargebeeId(passThruContent.subscriptionId).then(function(subscription) {
    subscription.update({planId: passThruContent.planId, subscriptionPlanId: passThruContent.subscriptionPlanId}).then(function(updatedSub) {

      let params = planConstants[passThruContent.planId];
      params.paidSmsCount = params.paidSmsCount + passThruContent.paidSmsCount;

      updatedSub.SubscriptionPreference.update({ data: params }).then(function(preference) {
        deferred.resolve({result: updatedSub, redirect: false});
      }, function(error) {
        deferred.reject(error);
      });
    }, function(error) {
      deferred.reject(error);
    }).then(function(updatedSub) {

    })
  }, function(error) {
    deferred.reject(error);
  })

  return deferred.promise;
}

function cancelSubscription(subscriptionId, eventId) {
  let deferred = q.defer();

  findSubscriptionByChargebeeId(subscriptionId).then(function(subscription) {
    subscription.update({ active: false, lastWebhookId: eventId }, { returning: true }).then(function(subscription) {
      let promise = disableSubDependencies(subscription.accountId);
      deferred.resolve({ subscription: subscription, promise: promise });
    }, function(error) {
      deferred.reject(filters.errors(error));
    });
  }, function(error) {
    deferred.reject(error);
  });

  return deferred.promise;
}

function recurringSubscription(subscriptionId, eventId) {
  let deferred = q.defer();

  findSubscriptionByChargebeeId(subscriptionId).then(function(subscription) {
    subscription.update({ lastWebhookId: eventId }, { returning: true }).then(function(subscription) {
      let promise = recurringSubDependencies(subscription);
      deferred.resolve({ subscription: subscription, promise: promise });
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

function chargebeeSubUpdateViaCheckout(params, provider) {
  let deferred = q.defer();
  let passThruContent = JSON.stringify(params)
  if(!provider) {
    provider = chargebee.hosted_page.checkout_existing;
  }

  provider({
    subscription: {
      id: params.subscriptionId,
      plan_id: params.planId
    },
    redirect_url: "http://user.focus.com:8080/dashboard#/account-profile/upgrade-plan",
    cancel_url: "http://user.focus.com:8080/dashboard#/account-profile/upgrade-plan",
    pass_thru_content: passThruContent
  }).request(function(error,result){
    if(error){
      deferred.reject(error);
    }else{
      deferred.resolve(result.hosted_page);
    }
  });

  return deferred.promise;
}

function chargebeeSubUpdate(params, provider) {
  let deferred = q.defer();

  if(!provider) {
    provider = chargebee.subscription.update;
  }

  chargebee.subscription.update(params.subscriptionId, { plan_id: params.planId }).request(function(error,result){
    if(error){
      deferred.reject(error);
    }else{
      deferred.resolve(result);
    }
  });

  return deferred.promise;
}

function accountHasValidCeditCard(subscriptionId) {
  let deferred = q.defer();

  chargebee.subscription.retrieve(subscriptionId).request(function(error,result){
    if(error){
      deferred.reject(error);
    }else{
      deferred.resolve(result.customer.card_status)
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

function chargebeePassParams(result) {
  return {
    id: result.subscription.id,
    subscriptionId: result.subscription.subscriptionId,
    planId: result.newPlan.chargebeePlanId,
    subscriptionPlanId: result.newPlan.id,
    paidSmsCount: result.newPlan.paidSmsCount
  }
}

function chargebeeSubParams(accountUser) {
  return {
    plan_id: 'free',
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
    }).catch(function(error) {
      cb(error);
    });
  }
}

function disableSubDependencies(accountId) {
  let deferred = q.defer();
  let where = { where: { accountId: accountId } };

  let arrayFunctions = [
    parallelFunc(models.Session.update({ active: false }, where)),
    parallelFunc(models.Survey.update({ closed: true }, where))
    // needs contact list
  ];

  async.parallel(arrayFunctions, function(error, _result) {
    if(error) {
      airbrake.notify(error);
      deferred.reject(error);
    }
    else {
      deferred.resolve();
    }
  });

  return deferred.promise;
}

function recurringSubDependencies(subscription) {
  let deferred = q.defer();
  let plan = subscription.SubscriptionPlan;
  let preference = subscription.SubscriptionPreference;

  let params = prepareRecurringParams(plan, preference);

  preference.update(params, { returning: true }).then(function(updatedPreference) {
    subscription.SubscriptionPreference = updatedPreference;
    deferred.resolve(subscription);
  }).catch(function(error) {
    airbrake.notify(error);
    deferred.reject(filters.errors(error));
  });

  return deferred.promise;
}

function prepareRecurringParams(plan, preference) {
  return {
    data: {
      paidSmsCount: preference.data.paidSmsCount + plan.paidSmsCount
    }
  }
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
      let defaultListCount = 4; // By default each user has 4 contact lists: Account Managers, Facilitators, Observers and Surveys
      if(defaultListCount < c){
        errors.contactList = MESSAGES.validation.contactList;
      }

      cb(null, errors);
    }, function(error) {
      cb(error);
    });
  }
}
