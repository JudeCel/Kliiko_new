'use strict';

var models = require('./../models');
var filters = require('./../models/filters');
var airbrake = require('./../lib/airbrake').instance;
var quotesMailer = require('../mailers/quotes');

var Subscription = models.Subscription;
var AccountUser = models.AccountUser;
var Account = models.Account;
var SubscriptionPlan = models.SubscriptionPlan;
var SubscriptionPreference = models.SubscriptionPreference;

var q = require('q');
var _ = require('lodash');
var async = require('async');
var chargebee = require('./../lib/chargebee').instance;
var planConstants = require('./../util/planConstants');
var constants = require('../util/constants');
var MessagesUtil = require('./../util/messages');

const getAQuoteFieldsNeeded = [
  'firstName',
  'lastName',
  'contactNumber',
  'email',
  'companyName',
  'positionInCompany',
  'companyUrl',
  'comments'
]

module.exports = {
  messages: MessagesUtil.subscription,
  findSubscription: findSubscription,
  findSubscriptionByChargebeeId: findSubscriptionByChargebeeId,
  createPortalSession: createPortalSession,
  createSubscription: createSubscription,
  updateSubscription: updateSubscription,
  cancelSubscription: cancelSubscription,
  recurringSubscription: recurringSubscription,
  getAllPlans: getAllPlans,
  retrievCheckoutAndUpdateSub: retrievCheckoutAndUpdateSub,
  getChargebeeSubscription: getChargebeeSubscription,
  postQuote: postQuote,
  createSubscriptionOnFirstLogin: createSubscriptionOnFirstLogin
}

function postQuote(params) {
  let deferred = q.defer();
  let errors = [];

  console.log(params, getAQuoteFieldsNeeded);
  _.map(getAQuoteFieldsNeeded, function(field) {
    if(!params[field]) {
      if(!errors.length) {
        errors.push(MessagesUtil.subscription.errorInField)
      }
      errors.push(_.startCase(field));
    }
  });

  if(!constants.emailRegExp.test(params.email)) {
    errors.push(MessagesUtil.subscription.emailFormat);
  }

  if(!constants.urlRegExp.test(params.companyUrl)) {
    errors.push(MessagesUtil.subscription.urlFormat);
  }

  if(!constants.phoneRegExp.test(params.contactNumber)) {
    errors.push(MessagesUtil.subscription.contactNumberFormat);
  }

  if(errors.length > 0) {
    deferred.reject(errors);
  }else{
    quotesMailer.sendQuote(params).then(function() {
      deferred.resolve({message: MessagesUtil.subscription.quoteSent});
    }, function(error) {
      deferred.reject(error);
    });
  }

  return deferred.promise;
}

function getChargebeeSubscription(subscriptionId, provider) {
  let deferred = q.defer();

  if(!provider) {
    provider = chargebee.subscription.retrieve;
  }

  provider(subscriptionId).request(function(error,result){
    if(error){
      deferred.reject(error);
    }else{
      deferred.resolve(result.subscription);
    }
  });

  return deferred.promise;
}

function getAllPlans(accountId) {
  let deferred = q.defer();
  let currentPlan = {};

  chargebee.plan.list({limit: 20}).request(function(error, result){
    if(error){
      deferred.reject(error);
    }else{
      if(accountId){
        findSubscription(accountId).then(function(currentSub) {
          if(currentSub.active){
            currentPlan = currentSub.SubscriptionPlan;
          }
          addPlanEstimateChargeAndConstants(result.list, accountId).then(function(planWithConstsAndEstimates) {
            deferred.resolve({currentPlan: currentPlan, plans: planWithConstsAndEstimates});
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
      // TODO Refacture to one function
      if(notNeedEstimatePrice(plan, accountSubscription)){
        plan.additionalParams = planConstants[plan.plan.id];
        plansWithAllInfo.push(plan);
        callback();
      }else if(needEstimatePrice(plan, accountSubscription)){
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
    deferred.reject(error);
  })

  return deferred.promise;
}


// TODO  re-write to one function
function notNeedEstimatePrice(plan, accountSubscription) {
  return plan.plan.id == accountSubscription.SubscriptionPlan.chargebeePlanId && plan.plan.id != "free_trial"
}

function needEstimatePrice(plan, accountSubscription) {
  return plan.plan.id != accountSubscription.SubscriptionPlan.chargebeePlanId && plan.plan.id != "free_trial"
}

// TODO this is realy plan ?
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
      // TODO why resolve?
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

  Subscription.find({ where: { accountId: accountId }, include: [SubscriptionPlan, SubscriptionPreference, Account] }).then(function(subscription) {
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
      deferred.reject(MessagesUtil.subscription.notFound.subscription);
    }
  }).catch(function(error) {
    deferred.reject(error);
  });

  return deferred.promise;
}

function createSubscription(accountId, userId, provider, plan) {
  let deferred = q.defer();

  findSubscription(accountId).then(function(subscription) {
    if(subscription) {
      deferred.reject(MessagesUtil.subscription.alreadyExists);
    }
    else {
      return AccountUser.find({ where: { AccountId: accountId, UserId: userId } });
    }
  }).then(function(accountUser) {
    if(accountUser) {
      return chargebeeSubCreate(chargebeeSubParams(accountUser, plan), provider);
    }
    else {
      deferred.reject(MessagesUtil.subscription.notFound.accountUser);
    }
  }).then(function(chargebeeSub) {
    return SubscriptionPlan.find({
      where: {
        chargebeePlanId: chargebeeSub.subscription.plan_id
      }
    }).then(function(plan) {
      if(plan){
        return models.sequelize.transaction(function (t) {
          return Subscription.create(subscriptionParams(accountId, chargebeeSub, plan.id), {transaction: t}).then(function(subscription) {
            return SubscriptionPreference.create({subscriptionId: subscription.id, data: planConstants[plan.chargebeePlanId]}, {transaction: t}).then(function() {
              return subscription;
            }, function(error) {
              // TODO Take a look!!!
              throw error;
            });
          });
        });
      }else{
        deferred.reject(MessagesUtil.subscription.notFound.subscriptionPlan);
      }
    });
  }).then(function(subscription) {
    deferred.resolve(subscription);
  }).catch(function(error) {
    deferred.reject(filters.errors(error));
  });

  return deferred.promise;
}

function createSubscriptionOnFirstLogin(accountId, userId, redirectUrl) {
  let deferred = q.defer();
  models.Account.find({
    where: {
      id: accountId
    }
  }).then(function(account) {
    if (!account) { return deferred.reject(MessagesUtil.subscription.notFound.account)}
    let plan = account.selectedPlanOnRegistration && (account.selectedPlanOnRegistration == "free_trial" || account.selectedPlanOnRegistration == "free_account") ?
      account.selectedPlanOnRegistration : null;
    createSubscription(accountId, userId, null, plan).then(function(response) {
      if(account.selectedPlanOnRegistration && !plan) {
        updateSubscription({
          accountId: account.id,
          newPlanId: account.selectedPlanOnRegistration,
          redirectUrl: redirectUrl
        }).then(function(response) {
          deferred.resolve(response);
        }, function(erros) {
          deferred.reject(error);
        });
      }else{
        deferred.resolve(response);
      }
    }, function(error) {
      deferred.reject(error);
    });
  }).catch(function(error) {
    console.log("-1");
    deferred.reject(error);
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
      deferred.reject(MessagesUtil.subscription.notFound.subscription);
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
      deferred.reject(MessagesUtil.subscription.notFound.subscription);
    }
  }).then(function(subscription) {
    return SubscriptionPlan.find({
      where: {
        chargebeePlanId: newPlanId
      }
    }).then(function(plan) {
      if(plan){
        return {accountName: subscription.Account.name, subscription: subscription, currentPlan: subscription.SubscriptionPlan, newPlan: plan}
      }else{
        deferred.reject(MessagesUtil.subscription.notFound.subscriptionPlan);
      }
    });
  }).then(function(result) {
    deferred.resolve(result);
  }, function(error) {
    deferred.reject(error);
  }).catch(function(error) {
    deferred.reject(error);
  });

  return deferred.promise;
}

function updateSubscription(params, providers) {
  let deferred = q.defer();

  // Thiss is because we need to moch chargebee responses for tests!!!
  if(!providers){
    providers = {
      creditCard: null,
      updateProvider: null,
      viaCheckout: null
    }
  }

  gatherInformation(params.accountId, params.newPlanId).then(function(result) {
    canSwitchPlan(params.accountId, result.currentPlan, result.newPlan).then(function() {
      accountHasValidCeditCard(result.subscription.subscriptionId, providers.creditCard).then(function(creditCardStatus){
        if(params.skipCardCheck || validCard(creditCardStatus)){
          chargebeeSubUpdate(chargebeePassParams(result), providers.updateProvider).then(function(chargebeSubscription) {
            updateSubscriptionData(chargebeePassParams(result)).then(function(result_1) {
              deferred.resolve(result_1);
            }, function(error) {
              deferred.reject(error);
            })
          }, function(error) {
            deferred.reject(error);
          })
        }else{
          chargebeeSubUpdateViaCheckout(chargebeePassParams(result), params.redirectUrl, providers.viaCheckout).then(function(hosted_page) {
            deferred.resolve({hosted_page: hosted_page, redirect: true});
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


function validCard(creditCardStatus) {
  return creditCardStatus == "valid"
}

function retrievCheckoutAndUpdateSub(hostedPageId) {
  let deferred = q.defer();

  chargebee.hosted_page.retrieve(hostedPageId).request(function(error, result){
    if(error){
      deferred.reject(error);
    }else{
      let passThruContent = JSON.parse(result.hosted_page.pass_thru_content)
      updateSubscriptionData(passThruContent).then(function(result) {
        deferred.resolve({message: MessagesUtil.subscription.successPlanUpdate});
      }, function(error) {
        deferred.reject(filters.errors(error));
      })
    }
  });

  return deferred.promise;
}

function updateSubscriptionData(passThruContent){
  let deferred = q.defer();
  findSubscriptionByChargebeeId(passThruContent.subscriptionId).then(function(subscription) {
    subscription.update({planId: passThruContent.planId, subscriptionPlanId: passThruContent.subscriptionPlanId, active: true}).then(function(updatedSub) {

      let params = _.cloneDeep(planConstants[passThruContent.planId]);
      if(passThruContent.oldPriority > params.priority || passThruContent.oldPriority == -1) {
        params.paidSmsCount = params.paidSmsCount + passThruContent.paidSmsCount;
      }
      else {
        let smsCount = passThruContent.paidSmsCount - passThruContent.planSmsCount;
        smsCount = smsCount > 0 ? smsCount : 0;
        params.paidSmsCount = params.paidSmsCount > smsCount ? params.paidSmsCount : smsCount;
      }

      updatedSub.SubscriptionPreference.update({ data: params }).then(function(preference) {
        deferred.resolve({subscription: updatedSub, redirect: false});
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

function cancelSubscription(subscriptionId, eventId, provider) {
  let deferred = q.defer();
  findSubscriptionByChargebeeId(subscriptionId).then(function(subscription) {
    disableSubDependencies(subscription.accountId).then(function() {
      updateSubscription({accountId: subscription.accountId, newPlanId: "free_account", skipCardCheck: true}, provider).then(function() {
        deferred.resolve();
      }, function(error) {
        deferred.reject(error);
      });
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

function chargebeeSubUpdateViaCheckout(params, redirectUrl, provider) {
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
    redirect_url: redirectUrl,
    cancel_url: redirectUrl,
    pass_thru_content: passThruContent,
    embed: "false"
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

  provider(params.subscriptionId, { plan_id: params.planId }).request(function(error, result){
    if(error){
      deferred.reject(error.message);
    }else{
      deferred.resolve(result);
    }
  });

  return deferred.promise;
}

function accountHasValidCeditCard(subscriptionId, provider) {
  let deferred = q.defer();


  if(!provider){
    provider = chargebee.subscription.retrieve
  }

  provider(subscriptionId).request(function(error, result){
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
    paidSmsCount: result.subscription.SubscriptionPreference.data.paidSmsCount,
    planSmsCount: result.subscription.SubscriptionPreference.data.planSmsCount,
    oldPriority: result.subscription.SubscriptionPlan.priority,
    accountName: result.accountName
  }
}

function chargebeeSubParams(accountUser, plan) {
  return {
    plan_id: plan || 'free_trial',
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
    parallelFunc(models.Session.update({ status: "closed" }, where)),
    parallelFunc(models.Survey.update({ closed: true }, where)),
    parallelFunc(models.ContactList.update({ active: false }, where))
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

  if(currentPlan.priority < newPlan.priority){
    let functionArray = [
      validateSessionCount(accountId, newPlan),
      validateSurveyCount(accountId, newPlan),
      validateContactListCount(accountId, newPlan)
    ]
    async.waterfall(functionArray, function(systemError, errorMessages) {
      if(systemError){
        deferred.reject(systemError);
      }else{
        if(_.isEmpty(errorMessages)){
          deferred.resolve();
        }else{
          deferred.reject(errorMessages);
        }
      }
    });
  }else if(validatePlanPriority(newPlan.priority, currentPlan.priority)){
    deferred.resolve();
  }
  else if(newPlan.priority == currentPlan.priority && newPlan.priority == -1 && newPlan.chargebeePlanId != currentPlan.chargebeePlanId) {
    deferred.resolve();
  }else{
    findSubscription(accountId).then(function(subscription) {
      if(subscription.active){
        deferred.reject(MessagesUtil.subscription.cantSwitchPlan);
      }else{
        deferred.resolve();
      }
    })
  }

  return deferred.promise;
}

function validatePlanPriority(newPlanPriority, currentPlanPriority) {
  if(newPlanPriority == currentPlanPriority) {
    return false;
  }else if(newPlanPriority == -1) {
    return true;
  }else if(currentPlanPriority > newPlanPriority){
    return true;
  }else{
    return false;
  }
}

function validateSessionCount(accountId, newPlan) {
  return function(cb) {
    models.Session.count({
      where: {
        accountId: accountId,
        status: 'open',
        endTime: {
          $gte: new Date()
        }
      }
    }).then(function(c) {
      if(newPlan.sessionCount < c){
        cb(null, {session: MessagesUtil.subscription.validation.session});
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
        errors.survey = MessagesUtil.subscription.validation.survey;
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
      // TODO WTF!!!
      let defaultListCount = 4; // By default each user has 4 contact lists: Account Managers, Hosts, Spectators and Guests
      if((defaultListCount + newPlan.contactListCount) < c){
        errors.contactList = MessagesUtil.subscription.validation.contactList;
      }

      cb(null, errors);
    }, function(error) {
      cb(error);
    });
  }
}
