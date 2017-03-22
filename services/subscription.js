'use strict';

var models = require('./../models');
var filters = require('./../models/filters');
var airbrake = require('./../lib/airbrake').instance;
var quotesMailer = require('../mailers/quotes');

const { Subscription, AccountUser, Account, SubscriptionPlan, SubscriptionPreference} = models

var q = require('q');
var _ = require('lodash');
var async = require('async');
let Bluebird = require('bluebird');
var chargebee = require('./../lib/chargebee').instance;
const PLAN_CONSTANTS = require('./../util/planConstants');
var planFeatures = require('./../util/planFeatures');
var constants = require('../util/constants');
var ipCurrency = require('../lib/ipCurrency');
var MessagesUtil = require('./../util/messages');
var moment = require('moment-timezone');

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
  createSubscriptionOnFirstLogin: createSubscriptionOnFirstLogin,
  getSubscriptionEndDate: getSubscriptionEndDate
}

function postQuote(params) {
  let deferred = q.defer();
  let errors = [];

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

  if(params.companyUrl && params.companyUrl != "" && !constants.urlRegExp.test(params.companyUrl)) {
    errors.push(MessagesUtil.subscription.urlFormat);
  }

  if(params.contactNumber && params.contactNumber != "" && !constants.phoneRegExp.test(params.contactNumber)) {
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
    if (error) {
      deferred.reject(error);
    } else {
      deferred.resolve(result.subscription);
    }
  });

  return deferred.promise;
}

function getAllPlans(accountId, ip) {
  let deferred = q.defer();

  chargebee.plan.list({ limit: 100, 'status[is]': 'active' }).request(function(error, result) {
    if (error) {
      deferred.reject(error);
    } else {
      // TODO: TEMP CURRENCY FIX
      let plans = result.list.filter((item) => item.plan.currency_code === 'AUD');

      if (accountId) {
        let currentPlan, currencyData;
        ipCurrency.get({ ip }).then((data) => {
          currencyData = data;
          return findAndProcessSubscription(accountId);
        }).then((currentSub) => {
          currentPlan = currentSub && currentSub.active && currentSub.SubscriptionPlan || {};
          return addPlanEstimateChargeAndConstants(plans, accountId);
        }).then(function(planWithConstsAndEstimates) {
          const free_account = getFreeAccountRemoveTrial(planWithConstsAndEstimates);
          plans = mapPlans(planWithConstsAndEstimates);
          deferred.resolve({ currentPlan, plans, free_account, currencyData, features: planFeatures.features, additionalParams: PLAN_CONSTANTS });
        }).catch((error) => {
          deferred.reject(filters.errors(error));
        });
      } else {
        deferred.resolve(plans);
      }
    }
  });

  return deferred.promise;
}

function getFreeAccountRemoveTrial(plans) {
  const free = _.remove(plans, (item) => ['free_trial', 'free_account'].includes(item.plan.id)); // remove free plans
  return free.find((item) => item.plan.id === 'free_account');
}

function mapPlans(plans) {
  plans = _.groupBy(plans, (item) => item.plan.currency_code); // group by currency
  constants.supportedCurrencies.forEach((currency) => {
    plans[currency] = _.orderBy(plans[currency], (item) => PLAN_CONSTANTS[item.plan.preference].priority, ['asc']); // order by priority
    plans[currency] = _.groupBy(plans[currency], (item) => item.plan.period_unit); // group by period
  });
  return plans;
}

function addPlanEstimateChargeAndConstants(plans, accountId) {
  let deferred = q.defer();
  let plansWithAllInfo = [];

  findSubscription(accountId).then(function(accountSubscription) {
    async.each(plans, function(plan, callback) {
      const preferenceName = PLAN_CONSTANTS.preferenceName(plan.plan.id);
      // TODO Refacture to one function
      if(notNeedEstimatePrice(preferenceName, accountSubscription)){
        plan.plan.preference = preferenceName;
        plansWithAllInfo.push(plan);
        callback();
      }else if(needEstimatePrice(preferenceName, accountSubscription)){
        getEstimateCharge(plan, accountSubscription).then(function(planWithEstimate) {
          planWithEstimate.plan.preference = preferenceName;
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
function notNeedEstimatePrice(preferenceName, accountSubscription) {
  return preferenceName == accountSubscription.SubscriptionPlan.preferenceName && preferenceName != "free_trial"
}

function needEstimatePrice(preferenceName, accountSubscription) {
  return preferenceName != accountSubscription.SubscriptionPlan.preferenceName && preferenceName != "free_trial"
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

function processFreeTrialPlanInformation(accountId, subscription) {
  return new Bluebird(function (resolve, reject) {
    let currentPlan = subscription.SubscriptionPlan;
    if (currentPlan.preferenceName == 'free_trial') {
      getChargebeeSubscription(subscription.subscriptionId).then(function(chargebeeSub) {
          let ends = moment.unix(chargebeeSub.current_term_end);
          currentPlan.dataValues.daysLeft = ends.diff(new Date(), 'days');
        resolve(subscription);
      }, function(error) {
        reject(error);
      })
    } else {
      resolve(subscription);
    }
  });
}

function findAndProcessSubscription(accountId) {
  return new Bluebird(function (resolve, reject) {
    findSubscription(accountId).then(function(subscription) {
      if (subscription) {
        processFreeTrialPlanInformation(accountId, subscription).then(function(updatedSubscription) {
          resolve(updatedSubscription);
        }, function(err) {
          resolve(subscription);
        });
      } else {
        //return empty - subscription not found
        resolve(subscription);
      }
    }, function(error) {
      reject(filters.errors(error));
    });
  });
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

  // TODO need refacture!!!
  findSubscription(accountId).then(function(subscription) {
    if (subscription) {
      deferred.reject(MessagesUtil.subscription.alreadyExists);
    } else {
      return AccountUser.find({ where: { AccountId: accountId, UserId: userId } });
    }
  }).then(function(accountUser) {
    if (accountUser) {
      return chargebeeSubCreate(chargebeeSubParams(accountUser, plan), provider);
    } else {
      deferred.reject(MessagesUtil.subscription.notFound.accountUser);
    }
  }).then(function(chargebeeSub) {
    return SubscriptionPlan.find({
      where: {
        chargebeePlanId: chargebeeSub.subscription.plan_id
      }
    }).then(function(plan) {
      if (plan) {
        let transactionPool = models.sequelize.transactionPool;
        let tiket = transactionPool.getTiket();
        let deferredTransactionPool = q.defer();

        transactionPool.once(tiket, () => {
          models.sequelize.transaction(function (t) {
            return Subscription.create(subscriptionParams(accountId, chargebeeSub, plan.id), {transaction: t}).then(function(subscription) {
              return SubscriptionPreference.create({subscriptionId: subscription.id, data: PLAN_CONSTANTS[plan.preferenceName]}, {transaction: t}).then(function() {
                transactionPool.emit(transactionPool.CONSTANTS.endTransaction, tiket);
                deferredTransactionPool.resolve(subscription);
              }, function(error) {
                transactionPool.emit(transactionPool.CONSTANTS.endTransaction, tiket);
                // TODO Take a look!!!
                throw error;
              });
            });
          }).catch(function(error) {
            transactionPool.emit(transactionPool.CONSTANTS.endTransaction, tiket);
            deferredTransactionPool.reject(error);
          });
        });

        transactionPool.once(transactionPool.timeoutEvent(tiket), () => {
            throw("Server Timeoute");
        });

        transactionPool.emit(transactionPool.CONSTANTS.nextTick);
        return deferredTransactionPool.promise;

      } else {
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
      account.selectedPlanOnRegistration : "free_trial";
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
        response.selectedPlanOnRegistration = account.selectedPlanOnRegistration;
        deferred.resolve(response);
      }
    }, function(error) {
      deferred.reject(error);
    });
  }).catch(function(error) {
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
        if(params.skipCardCheck) {
          chargebeeSubUpdate(chargebeePassParams(result), providers.updateProvider).then(function(chargebeSubscription) {
            updateSubscriptionData(chargebeePassParams(result, chargebeSubscription.subscription)).then(function(result_1) {
              deferred.resolve(result_1);
            }, function(error) {
              deferred.reject(error);
            })
          }, function(error) {
            deferred.reject(error);
          })
        } else {
          chargebeeSubUpdateViaCheckout(chargebeePassParams(result), params.redirectUrl, providers.viaCheckout).then(function(hosted_page) {
            deferred.resolve({hosted_page: hosted_page, redirect: true});
          }, function(error) {
            deferred.reject(error);
          })
        }

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
    if (error) {
      deferred.reject(error);
    } else {
      let passThruContent = JSON.parse(result.hosted_page.pass_thru_content);
      getChargebeeSubscription(passThruContent.subscriptionId).then(function(subscription) {
        passThruContent.endDate = getSubscriptionEndDate(subscription);
        updateSubscriptionData(passThruContent).then(function(result) {
          deferred.resolve({message: MessagesUtil.subscription.successPlanUpdate});
        }, function(error) {
          deferred.reject(filters.errors(error));
        });
      }, function(error) {
        deferred.reject(filters.errors(error));
      });
    }
  });

  return deferred.promise;
}

function updateSubscriptionData(passThruContent){
  let deferred = q.defer();
  findSubscriptionByChargebeeId(passThruContent.subscriptionId).then(function(subscription) {
    subscription.update({planId: passThruContent.planId, subscriptionPlanId: passThruContent.subscriptionPlanId, active: true, endDate: passThruContent.endDate }).then(function(updatedSub) {

      let params = _.cloneDeep(PLAN_CONSTANTS[subscription.SubscriptionPlan.preferenceName]);
      params.paidSmsCount = subscription.SubscriptionPreference.data.paidSmsCount;

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

function cancelSubscription(subscriptionId, eventId, provider, chargebeeSub) {
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

function recurringSubscription(subscriptionId, eventId, provider, chargebeeSub) {
  let deferred = q.defer();

  findSubscriptionByChargebeeId(subscriptionId).then(function(subscription) {

    subscription.update({ lastWebhookId: eventId, endDate: getSubscriptionEndDate(chargebeeSub) }, { returning: true }).then(function(subscription) {
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
  let passThruContent = JSON.stringify(params);

  // for tests only!
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
    subscriptionPlanId: subscriptionPlanId,
    endDate: getSubscriptionEndDate(chargebeeSub.subscription)
  }
}

function chargebeePortalParams(subscription, callbackUrl) {
  return {
    redirect_url: callbackUrl,
    customer: { id: subscription.customerId }
  }
}

function chargebeePassParams(result, subscription) {
  return {
    id: result.subscription.id,
    subscriptionId: result.subscription.subscriptionId,
    planId: result.newPlan.chargebeePlanId,
    subscriptionPlanId: result.newPlan.id,
    paidSmsCount: result.subscription.SubscriptionPreference.data.paidSmsCount,
    planSmsCount: result.subscription.SubscriptionPreference.data.planSmsCount,
    oldPriority: result.subscription.SubscriptionPlan.priority,
    accountName: result.accountName,
    endDate: getSubscriptionEndDate(subscription)
  }
}

function getSubscriptionEndDate(subscription) {
  return subscription ? new Date((subscription.current_term_end || subscription.trial_end) * 1000) : null;
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
      planSmsCount: plan.planSmsCount
    }
  }
}

// Validators
function canSwitchPlan(accountId, currentPlan, newPlan){
  let deferred = q.defer();

    let functionArray = [
      validateIfNotCurrentPlan(accountId, newPlan),
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

  return deferred.promise;
}

function validateIfNotCurrentPlan(accountId, newPlan) {
  return function(cb) {
    models.Subscription.find({
      where: {
        accountId: accountId
      },
      include: [SubscriptionPlan, SubscriptionPreference, Account]
    }).then(function(subscription) {
      if(subscription.planId == newPlan.chargebeePlanId){
        cb(null, {plan: MessagesUtil.subscription.cantSwitchPlan});
      }else{
        cb(null, {});
      }
    }, function(error) {
      cb(error);
    });
  }
}

function validateSessionCount(accountId, newPlan) {
  return function(errors, cb) {
    models.Session.count({
      where: {
        accountId: accountId,
        status: 'open',
        endTime: {
          $gte: new Date()
        }
      }
    }).then(function(c) {
      errors = errors || {};
      if(newPlan.sessionCount !== -1 && newPlan.sessionCount < c) {
        errors.session = MessagesUtil.subscription.validation.session;
      }
      cb(null, errors);
    }, function(error) {
      cb(error);
    });
  }
}

function validateSurveyCount(accountId, newPlan) {
  return function(errors, cb) {
    models.Survey.count({
      where: {
        accountId: accountId,
        closed: false,
        confirmedAt: null
      }
    }).then(function(c) {
      errors = errors || {};
      if(newPlan.surveyCount !== -1 && newPlan.surveyCount < c) {
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
        accountId: accountId,
        active: true,
        editable: true
      }
    }).then(function(c) {
      errors = errors || {};
      if(newPlan.contactListCount !== -1 && newPlan.contactListCount < c) {
        errors.contactList = MessagesUtil.subscription.validation.contactList;
      }
      cb(null, errors);
    }, function(error) {
      cb(error);
    });
  }
}
