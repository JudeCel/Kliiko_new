'use strict';

var models = require('./../models');
var filters = require('./../models/filters');
var quotesMailer = require('../mailers/quotes');

const { Subscription, AccountUser, Account, SubscriptionPlan, SubscriptionPreference} = models

var q = require('q');
var _ = require('lodash');
var async = require('async');
let Bluebird = require('bluebird');
var chargebee = require('./../lib/chargebee').instance;
const PLAN_CONSTANTS = require('./../util/planConstants');
const PLANS = require('./../util/plans/index');
var planFeatures = require('./../util/planFeatures');
var constants = require('../util/constants');
var ipCurrency = require('../lib/ipCurrency');
var MessagesUtil = require('./../util/messages');
var moment = require('moment-timezone');

/** @typedef {Object} ChargeBeePlan
 * @property {Object} plan
 * @property {string} plan.id
 * @property {string} plan.name
 * @property {string} plan.price
 * @property {string} plan.period
 * @property {string} plan.period_unit
 * @property {string} plan.trial_period
 * @property {string} plan.trial_period_unit
 * @property {string} plan.charge_model
 * @property {string} plan.free_quantity
 * @property {string} plan.status
 * @property {string} plan.enabled_in_hosted_pages
 * @property {string} plan.enabled_in_portal
 * @property {string} plan.object
 * @property {string} plan.taxable
 * @property {string} plan.currency_code
 * */

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
  getSubscriptionEndDate: getSubscriptionEndDate,
  getPlansFromStore: getPlansFromStore
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

function getPlansFromStore() {
  const client = require('redis').createClient(process.env.REDIS_PORT, process.env.REDIS_HOST);
  client.select(parseInt(process.env.REDIS_DB));
  const key = 'subscriptionPlans';

  return new Bluebird((resolve, reject) => {
    client.hgetall(key, (error, object) => {
      if (error) {
        return reject(error);
      }

      const current = new Date();
      if(object && parseInt(object.expire) > current.getTime()) {
        let storedPlans = {plans: JSON.parse(object.plans)};
        storedPlans.planDetails = {features: planFeatures.features, additionalParams: PLAN_CONSTANTS};
        resolve(storedPlans);
      } else {
        getAllPlans().then((plansResult) => {
          const expire = moment(current).add(45, 'm');
          client.hmset(key, 'expire', expire.valueOf(), 'plans', JSON.stringify(plansResult));
          let storedPlans = {
            plans: plansResult,
            planDetails: {features: planFeatures.features, additionalParams: PLAN_CONSTANTS}
          };
          resolve(storedPlans);
        }, (error) => {
          reject(error);
        });
      }
    });
  });
}

function getAllPlans(accountId, ip) {
  let deferred = q.defer();

  chargebee.plan.list({ limit: 100, 'status[is]': 'active' }).request(function(error, result) {
    if (error) {
      deferred.reject(error);
    } else {
      if (accountId) {
        let currentPlan, currencyData, plans;
        findAndProcessSubscription(accountId).then((currentSub) => {
          currencyData = { client: currentSub.Account.currency };
          currentPlan = currentSub && currentSub.active && currentSub.SubscriptionPlan || {};
          plans = filterSupportedPlans(result.list, currencyData, Object.keys(PLANS));
          return addPlanEstimateChargeAndConstants(plans, accountId);
        }).then(function(planWithConstsAndEstimates) {
          const free_account = getFreeAccountRemoveTrial(planWithConstsAndEstimates);
          planWithConstsAndEstimates = removeOldPlans(planWithConstsAndEstimates);
          plans = mapPlans(planWithConstsAndEstimates);
          deferred.resolve({ currentPlan, plans, free_account, currencyData, features: planFeatures.features, additionalParams: PLAN_CONSTANTS });
        }).catch((error) => {
          deferred.reject(filters.errors(error));
        });

        // TODO: DISABLED UNTIL CHARGEBEE FIXES CURRENCY CHANGES
        // ipCurrency.get({ ip }).then((data) => {
        //   currencyData = data;
        //   return findAndProcessSubscription(accountId);
        // }).then((currentSub) => {
        //   currentPlan = currentSub && currentSub.active && currentSub.SubscriptionPlan || {};
        //   return addPlanEstimateChargeAndConstants(plans, accountId);
        // }).then(function(planWithConstsAndEstimates) {
        //   const free_account = getFreeAccountRemoveTrial(planWithConstsAndEstimates);
        //   plans = mapPlans(planWithConstsAndEstimates);
        //   deferred.resolve({ currentPlan, plans, free_account, currencyData, features: planFeatures.features, additionalParams: PLAN_CONSTANTS });
        // }).catch((error) => {
        //   deferred.reject(filters.errors(error));
        // });
      } else {
        const plans = filterSupportedPlans(result.list, null, Object.keys(PLANS));
        deferred.resolve(plans);
      }
    }
  });

  return deferred.promise;
}

function getFreeAccountRemoveTrial(plans) {
  const remove = ['free_trial', 'free_account'];
  const free = _.remove(plans, (item) => remove.includes(PLAN_CONSTANTS.preferenceName(item.plan.id)));
  return free.find((item) => item.plan.id.includes('free_account'));
}

function removeOldPlans(plans) {
  const remove = ['core_monthly', 'core_yearly', 'junior_monthly','junior_yearly', 'senior_monthly', 'senior_yearly'];
  _.remove(plans, (item) => remove.includes(PLAN_CONSTANTS.preferenceName(item.plan.id)));
  return plans;
}

function mapPlans(plans) {
  plans = _.groupBy(plans, (item) => item.plan.currency_code); // group by currency
  constants.supportedCurrencies.forEach((currency) => {
    plans[currency] = _.orderBy(plans[currency], (item) => {
      return PLAN_CONSTANTS[item.plan.preference].priority;
    }, ['asc']); // order by priority
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
  return preferenceName == accountSubscription.SubscriptionPlan.preferenceName && !preferenceName.includes("free_trial")
}

function needEstimatePrice(preferenceName, accountSubscription) {
  return preferenceName != accountSubscription.SubscriptionPlan.preferenceName && !preferenceName.includes("free_trial")
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
    if (currentPlan.preferenceName.includes('free_trial')) {
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

  Subscription.find({ where: { subscriptionId: subscriptionId }, include: [SubscriptionPlan, SubscriptionPreference, Account] }).then(function(subscription) {
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

function findSubscriptionId(subscriptionId) {
  return Subscription
    .find({
      where: { id: subscriptionId },
      include: [SubscriptionPlan, SubscriptionPreference, Account],
    })
    .then((subscription) => {
      if (!subscription) {
        throw MessagesUtil.subscription.notFound.subscription;
      }

      return subscription;
    });
}

function findPreferencesBySubscriptionId(subscriptionId) {
  return SubscriptionPreference
    .find({
      where: { data: { $contains: { availableSessions: [{ subscriptionId: subscriptionId }] } } },
      include: [ { model: Subscription, include: [SubscriptionPlan, Account], }],
    })
    .then((preferences) => {
      if (!preferences) {
        throw MessagesUtil.subscription.notFound.subscription;
      }

      return preferences;
    });
}

function createSubscription(accountId, userId, provider, plan) {
  let deferred = q.defer();

  // TODO need refacture!!!
  findSubscription(accountId).then(function(subscription) {
    if (subscription) {
      deferred.reject(MessagesUtil.subscription.alreadyExists);
    } else {
      return AccountUser.find({ where: { AccountId: accountId, UserId: userId }, include: [models.Account] });
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
    const selected = account.selectedPlanOnRegistration;
    let plan = ['free_trial', 'free_account'].includes(selected) ? selected : 'free_trial';
    plan = buildCurrencyPlan(plan, account.currency);
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

function buildCurrencyPlan(plan, currency) {
  return `${plan}_${currency}`;
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

/**
 * @param {object} params
 * @param {string} params.accountId
 * @param {string} params.newPlanId
 * @param {object} [params.resources]
 * @param {number} [params.resources.sessionCount]
 * @param {string} [params.redirectUrl]
 * @param providers
 */
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
  const resources = params.resources;

  gatherInformation(params.accountId, params.newPlanId).then(function(result) {
    canSwitchPlan(params.accountId, result.currentPlan, result.newPlan).then(function() {
        if(params.skipCardCheck) {
          // skipCardCheck is 'true' only in case cancellation
          chargebeeSubUpdate(chargebeePassParams(result), providers.updateProvider).then(function(chargebeSubscription) {
            updateSubscriptionData(chargebeePassParams(result, chargebeSubscription.subscription, resources))
              .then(function (/**@typedef {{subscription: Object, redirect: boolean}} */subResult) {
                deferred.resolve(subResult);
              }, function (error) {
                deferred.reject(error);
              });
          }, function(error) {
            deferred.reject(error);
          })
        } else {
          chargebeeSubCreateViaCheckout(chargebeePassParams(result, null, resources), params.redirectUrl, providers.viaCheckout).then(function(hosted_page) {
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
  });

  return deferred.promise;
}

function cleanupAfterUpdate(accountId, oldPlan, newPlan) {
  let deferred = q.defer();

  oldPlan = PLAN_CONSTANTS.preferenceName(oldPlan);
  newPlan = PLAN_CONSTANTS.preferenceName(newPlan);
  const array = [
    updateSessionTopics(accountId, oldPlan, newPlan)
  ];

  async.waterfall(array, (systemError, errorMessages) => {
    if(systemError || !_.isEmpty(errorMessages)) {
      deferred.reject(systemError || errorMessages);
    }
    else {
      deferred.resolve();
    }
  });

  return deferred.promise;
}

function updateSessionTopics(accountId, oldPlan, newPlan) {
  return function(cb) {
    const oldCount = PLAN_CONSTANTS[oldPlan].topicCount;
    const newCount = PLAN_CONSTANTS[newPlan].topicCount;

    if(newCount >= oldCount && oldCount !== -1 || newCount === -1) {
      cb();
    }
    else {
      models.SessionTopics.findAll({
        include: [{
          model: models.Session,
          where: { accountId }
        }, {
          model: models.Topic,
          where: { stock: false, default: false }
        }]
      }).then((result) => {
        let topics = [];
        result = _.orderBy(result, ['order', 'topicId'], ['asc', 'asc']);
        result = _.groupBy(result, 'sessionId');
        _.forIn(result, (value, key) => {
          _.remove(value, (item, index) => index < newCount);
          topics = _.merge(topics, _.map(value, 'id'));
        });
        const sessions = Object.keys(result);
        models.SessionTopics.update({ active: false }, { where: { id: { $in: topics }, sessionId: { $in: sessions } } }).then(() => {
          cb();
        }).catch(cb);
      });
    }
  }
}

function retrievCheckoutAndUpdateSub(hostedPageId) {
  let deferred = q.defer();

  chargebee.hosted_page.retrieve(hostedPageId).request(function(error, result){
    if (error) {
      deferred.reject(error);
    } else {
      let passThruContent = JSON.parse(result.hosted_page.pass_thru_content);
      let subscriptionId = result.hosted_page.content.subscription.id;
      passThruContent.subscriptionId = subscriptionId;
      getChargebeeSubscription(subscriptionId).then(function(subscription) {
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

/**
 * @param {object} subscription
 * @param {object} passThruContent
 * @return {array}
 */
function calculateAvailableSessions(subscription, passThruContent) {
  // check if there were any session bought previously
  let availableSessions = _.get(subscription.SubscriptionPreference, 'data.availableSessions', []);
  // add additional bought sessions n times
  let availableSession = _.clone(passThruContent);
  availableSession.sessionCount = 1;
  _.times(passThruContent.sessionCount, () => {
    availableSessions.push(availableSession);
  });

  return availableSessions;
}

/**
 *
 * @param {object} passThruContent
 * @param {number} passThruContent.id
 * @param {number} passThruContent.sessionCount
 */
function updateSubscriptionData(passThruContent){
  let deferred = q.defer();
  findSubscriptionId(passThruContent.id).then(function(subscription) {
    const oldPlan = subscription.planId;
    subscription.update({planId: passThruContent.planId, subscriptionPlanId: passThruContent.subscriptionPlanId, active: true, endDate: passThruContent.endDate }).then(function(updatedSub) {

      let params = _.cloneDeep(PLAN_CONSTANTS[PLAN_CONSTANTS.preferenceName(passThruContent.planId)]);
      params.paidSmsCount = subscription.SubscriptionPreference.data.paidSmsCount;

      // increase count of additional bought sessions
      if (passThruContent.sessionCount) {
        const currentSessionCount = /free_trial/.test(oldPlan) ? 0 : subscription.SubscriptionPreference.data.sessionCount;
        params.sessionCount = currentSessionCount + passThruContent.sessionCount;
      }
      // recalc available sessions
      params.availableSessions = calculateAvailableSessions(subscription, passThruContent);

      updatedSub.SubscriptionPreference.update({ data: params }).then(function(preference) {
        cleanupAfterUpdate(subscription.accountId, oldPlan, passThruContent.planId).then(() => {
          deferred.resolve({subscription: updatedSub, redirect: false});
        }, function(error) {
          deferred.reject(error);
        });
      }, function(error) {
        deferred.reject(error);
      });
    }, function(error) {
      deferred.reject(error);
    }).then(function(updatedSub) {

    })
  }, function(error) {
    deferred.reject(error);
  });

  return deferred.promise;
}

function cancelSubscription(subscriptionId, eventId, provider, chargebeeSub) {
  let deferred = q.defer();
  findPreferencesBySubscriptionId(subscriptionId).then(function(preference) {
    let subscription = preference.Subscription;
    let history = preference.data.availableSessions;
    // check if there is at least one active subscription (endDate is in future)
    let active = _.some(history, function (item) {
      return moment().isBefore(item.endDate);
    });
    disableSubDependencies(subscription.accountId, subscriptionId).then(function() {
      if (active) {
        preference.data.sessionCount = preference.data.sessionCount - chargebeeSub.plan_quantity;
        preference.update({ data: preference.data })
          .then(function() {
            deferred.resolve();
          }, function (error) {
            deferred.reject(error);
          })
      } else {
        // there is no active subscription - switch account to "free_account" plan
        const plan = buildCurrencyPlan('free_account', subscription.Account.currency);
        updateSubscription({ accountId: subscription.accountId, newPlanId: plan, skipCardCheck: true }, provider)
          .then(function () {
            deferred.resolve();
          }, function (error) {
            deferred.reject(error);
          });
      }

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

function chargebeeSubCreateViaCheckout(params, redirectUrl, provider) {
  let deferred = q.defer();
  let passThruContent = JSON.stringify(params);

  // for tests only!
  if(!provider) {
    provider = chargebee.hosted_page.checkout_new;
  }

  provider({
    subscription: {
      plan_id: params.planId,
      plan_quantity: params.sessionCount,
    },
    billing_cycles: params.billing_cycles,
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

/**
 * Creates so called 'passThruContent'
 * @param result
 * @param subscription
 * @param {object} [resources]
 * @param {number} resources.sessionCount
 * @return {{id, subscriptionId, planId: (*|string|chargebeePlanId|{type, allowNull, validate}), subscriptionPlanId, paidSmsCount: (*|number), planSmsCount: (*|number|planSmsCount|{type, allowNull, defaultValue}), oldPriority, accountName, endDate}}
 */
function chargebeePassParams(result, subscription, resources = {}) {
  return {
    id: result.subscription.id,
    subscriptionId: result.subscription.subscriptionId,
    planId: result.newPlan.chargebeePlanId,
    subscriptionPlanId: result.newPlan.id,
    paidSmsCount: result.subscription.SubscriptionPreference.data.paidSmsCount,
    planSmsCount: result.subscription.SubscriptionPreference.data.planSmsCount,
    sessionCount: resources.sessionCount,
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
    plan_id: plan || buildCurrencyPlan('free_trial', accountUser.Account.currency),
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
    },
    billing_cycles: 1,
    plan_quantity: 1,
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

/**
 * Disable only resources of specific subscription if provided
 * @param {string} accountId
 * @param {string} [subscriptionId]
 */
function disableSubDependencies(accountId, subscriptionId) {
  let deferred = q.defer();
  let where = { where: { accountId: accountId } };
  let whereSession = { where: { accountId: accountId } };
  if (subscriptionId) {
    // disable only resources of specific subscription if provided
    whereSession.where.subscriptionId = subscriptionId;
  }

  let arrayFunctions = [
    parallelFunc(models.Session.update({ status: "closed" }, whereSession)),
    parallelFunc(models.Survey.update({ closed: true }, where)),
    parallelFunc(models.ContactList.update({ active: false }, where))
  ];

  async.parallel(arrayFunctions, function(error, _result) {
    if(error) {
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

/**
 * Filter out only supported subscription plans
 * Plan is supported if it matches client's currency and it is contained in the list of supported plans
 * @param {ChargeBeePlan[]} plans -
 * @param {Object} currencyData
 * @param {string[]} supportedPlans - array of names
 * @return {ChargeBeePlan[]}
 */
function filterSupportedPlans(plans, currencyData, supportedPlans) {
  const plansRegex = new RegExp(supportedPlans.join('|'));
  return plans.filter((item) => {
    const { plan } = item;
    return plan.id.match(plansRegex) && (!currencyData || plan.currency_code === currencyData.client);
  });
}

// Validators
function canSwitchPlan(accountId, currentPlan, newPlan){
  let deferred = q.defer();

    let functionArray = [
      // user need to be able to buy several sessions within the same plan several times
      validateSessionCount(accountId, newPlan),
      validateContactListCount(accountId, newPlan)
    ];
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
      let errors = {};
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
