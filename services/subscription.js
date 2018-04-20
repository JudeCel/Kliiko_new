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
var InfusionSoft = require('./../lib/infusionsoft');

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
  getPlansFromStore: getPlansFromStore,
  getInfusionTagForSub: getInfusionTagForSub,

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
        ipCurrency.get({ ip }).then((data) => {
          currencyData = data;
          return findAndProcessSubscription(accountId);
        }).then((currentSub) => {
          currencyData = currencyData || { client: currentSub.Account.currency };
          currentPlan = currentSub && currentSub.active && currentSub.SubscriptionPlan || {};
          plans = filterSupportedPlans(result.list, null, Object.keys(PLAN_CONSTANTS), constants.supportedCurrencies);
          return addPlanEstimateChargeAndConstants(plans, accountId);
        }).then(function(planWithConstsAndEstimates) {
          const free_account = getFreeAccountRemoveTrial(planWithConstsAndEstimates);
          planWithConstsAndEstimates = removeOldPlans(planWithConstsAndEstimates);
          plans = mapPlans(planWithConstsAndEstimates);
          deferred.resolve({ currentPlan, plans, free_account, currencyData, features: planFeatures.features, additionalParams: PLAN_CONSTANTS });
        }).catch((error) => {
          deferred.reject(filters.errors(error));
        });
      } else {
        const plans = filterSupportedPlans(result.list, null, Object.keys(PLAN_CONSTANTS), constants.supportedCurrencies);
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
      where: {
        $or: [
          { data: { $contains: { availableSessions: [{ subscriptionId: subscriptionId }] } } },
          { data: { $contains: { availableBrandColors: [{ subscriptionId: subscriptionId }] } } },
          {
            $and: [
              { '$Subscription.subscriptionId$': subscriptionId },
              { '$Subscription.planId$': { $like: 'free_%' } },
            ],
          },
        ],
      },
      include: [{ model: Subscription, include: [SubscriptionPlan, Account], }],
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
        chargebeePlanId: { $iLike: chargebeeSub.subscription.plan_id }
      }
    }).then(function(plan) {
      if (plan) {
        let transactionPool = models.sequelize.transactionPool;
        let tiket = transactionPool.getTiket();
        let deferredTransactionPool = q.defer();

        transactionPool.once(tiket, () => {
          models.sequelize.transaction({ autocommit: false }, function (t) {
            return Subscription.create(subscriptionParams(accountId, chargebeeSub, plan.id), { transaction: t })
              .then(function (subscription) {
                let preference = {
                  subscriptionId: subscription.id,
                  data: PLAN_CONSTANTS[plan.preferenceName],
                };
                return SubscriptionPreference.create(preference, { transaction: t })
                  .then(function () {
                    return models.User.findById(userId, { transaction: t })
                  })
                  .then(function (user) {
                    return markPaidAccountInInfusion(user, subscription);
                  })
                  .then(function() {
                    return t.commit();
                  })
                  .then(function () {
                    transactionPool.emit(transactionPool.CONSTANTS.endTransaction, tiket);
                    return deferredTransactionPool.resolve(subscription);
                  })
                  .catch(function (error) {
                    return t.rollback()
                      .then(()=>{
                        transactionPool.emit(transactionPool.CONSTANTS.endTransaction, tiket);
                        throw error;
                      })
                  });
              })
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
    createSubscription(accountId, userId, null, plan).then(function(subcription) {
      return addSessiontoTrialPlan(subcription);
    }).then(function(response) {
      if(account.selectedPlanOnRegistration && !plan) {
        updateSubscription({
          accountId: account.id,
          newPlanId: account.selectedPlanOnRegistration,
          redirectUrl: redirectUrl,
          skipCheck: true,
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

function addSessiontoTrialPlan(trialSubscription) {
  let trialAvailableSession = {
    'id': trialSubscription.id,
    'planId': trialSubscription.planId,
    'endDate': trialSubscription.endDate,
    'sessionId': null,
    'sessionCount': 1,
    'subscriptionId': trialSubscription.subscriptionId,
    'subscriptionPlanId': trialSubscription.subscriptionPlanId,
  };
  return models.SubscriptionPreference.find({ where: { subscriptionId: trialSubscription.id }})
    .then((preferences) => {
      if (!preferences.data.availableSessions) {
        preferences.data.availableSessions = [];
      }
      preferences.data.availableSessions.push(trialAvailableSession)
      return preferences.update({ data: preferences.data });
    })
    .then(() => trialSubscription);
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

/**
 * @param {string} accountId
 * @param {string} newPlanId
 * @return {{accountName:string, subscription:object, currentPlan:object, newPlan:object}}
 */
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
 * @param {string} params.userId
 * @param {string} params.newPlanId
 * @param {object} [params.resources]
 * @param {number} [params.resources.sessionCount]
 * @param {number} [params.resources.brandColorCount]
 * @param {string} [params.redirectUrl]
 * @param providers
 */
function updateSubscription(params, providers) {
  // Thiss is because we need to moch chargebee responses for tests!!!
  if(!providers){
    providers = {
      creditCard: null,
      updateProvider: null,
      viaCheckout: null
    }
  }
  const resources = params.resources;

  return gatherInformation(params.accountId, params.newPlanId)
    .then(function (/**@type{{accountName:string, subscription:object, currentPlan:object, newPlan:object}}*/result) {
      if (params.skipCardCheck) {
        // skipCardCheck is 'true' only in case cancellation
        return chargebeeSubUpdate(chargebeePassParams(result), providers.updateProvider)
          .then(function (chargebeeSubscription) {
            return updateSubscriptionData(chargebeePassParams(result, chargebeeSubscription.subscription, resources));
          });
      } else {
        return buyMoreSubscriptions(params, result, resources, providers);
      }
    });
}

/**
 * @param {object} params
 * @param {string} params.accountId
 * @param {string} params.userId
 * @param {string} params.newPlanId
 * @param {object} [params.resources]
 * @param {number} [params.resources.sessionCount]
 * @param {number} [params.resources.brandLogoAndCustomColors]
 * @param {string} [params.redirectUrl]
 * @param {object} result
 * @param {string} result.accountName
 * @param {object} result.subscription
 * @param {object} result.currentPlan
 * @param {object} result.newPlan
 * @param {object} resources
 * @param {object} providers
 * @return {{redirect: boolean, [redirect_url]: string, [hosted_page]: string, [message]: string}}
 */
function buyMoreSubscriptions(params, result, resources, providers) {
  return AccountUser.find({ where: { AccountId: params.accountId, UserId: params.userId } })
    .then(function (accountUser) {
        // buying more PAID plans
        return chargebeeSubCreateViaCheckout(
          chargebeePassParams(result, null, resources),
          chargebeeSubParams(accountUser, result.newPlan.chargebeePlanId),
          params.redirectUrlSessionPage,
          providers.viaCheckout
        );
    })
    .then(function (hostedPage) {
      return { hosted_page: hostedPage, redirect: true };
    });
}

function cleanupAfterUpdate(accountId, oldPlan, newPlan) {
  let deferred = q.defer();

  oldPlan = PLAN_CONSTANTS.preferenceName(oldPlan);
  newPlan = PLAN_CONSTANTS.preferenceName(newPlan);
  const array = [
    updateSessionTopics(accountId, oldPlan, newPlan),
    activeDefaultContactLists(accountId)
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

function activeDefaultContactLists(accountId) {
  return function (cb) {
    let query = {
      accountId: accountId,
      editable: false,
      active: false,
    };
    return models.ContactList.update({ active: true }, { where: query })
      .then(() => cb())
      .catch(cb);
  };
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
  if (/_annual_/.test(passThruContent.planId)) {
    availableSession.sessionCount = -1;
    availableSessions.push(availableSession);
  }

  return availableSessions;
}

/**
 * @param {object} subscription
 * @param {object} passThruContent
 * @return {array}
 */
function calculateAvailableBrandColors(subscription, passThruContent) {
  // check if there were any resource bought previously
  let availableBrandColors = _.get(subscription.SubscriptionPreference, 'data.availableBrandColors', []);
  // add additional bought resources
  let availableBrandColor = _.clone(passThruContent);
  availableBrandColor.brandColorCount = passThruContent.brandColorCount ? 1 : 0;
  _.times(passThruContent.brandColorCount, () => {
    availableBrandColors.push(availableBrandColor);
  });

  return availableBrandColors;
}

/**
 *
 * @param {object} passThruContent
 * @param {number} passThruContent.id
 * @param {string} passThruContent.planId
 * @param {string} passThruContent.subscriptionId
 * @param {string} passThruContent.subscriptionPlanId
 * @param {date} passThruContent.endDate
 * @param {number} passThruContent.sessionCount
 * @param {number} passThruContent.brandColorCount
 */
function updateSubscriptionData(passThruContent) {

  return Bluebird
    .join(
      findSubscriptionId(passThruContent.id),
      models.SubscriptionPlan.findById(passThruContent.subscriptionPlanId)
    )
    .spread((subscription, newPlan) => {
      const oldPlan = subscription.SubscriptionPlan;
      const oldPlanId = subscription.planId;
      const updates = {
        active: true,
        endDate: passThruContent.endDate
      };
      const isFreeAccount = /^free_account/.test(passThruContent.planId);
      const isFreeTrial = /^free_/.test(oldPlanId);
      // more expensive plan contains more features and also has bigger priority
      if (isFreeAccount || isFreeTrial || newPlan.priority > oldPlan.priority) {
        updates.planId = passThruContent.planId;
        updates.subscriptionId = passThruContent.subscriptionId;
        updates.subscriptionPlanId = passThruContent.subscriptionPlanId;
      }

      return subscription.update(updates)
        .then(function (updatedSub) {

          let newPreferenceData = _.cloneDeep(PLAN_CONSTANTS[PLAN_CONSTANTS.preferenceName(updatedSub.planId)]);
          newPreferenceData.paidSmsCount = subscription.SubscriptionPreference.data.paidSmsCount;

          const currentAmountSessions = /*isFreeTrial ? 0 :*/ subscription.SubscriptionPreference.data.sessionCount;
          // check if user already has infinite amount of resources
          if (currentAmountSessions === -1) {
            newPreferenceData.sessionCount = -1;
          } else {
            // check if user bought additional amount of resources
            if (newPreferenceData.sessionCount !== -1 && /_monthly_/.test(updatedSub.planId)) {
              newPreferenceData.sessionCount = currentAmountSessions + (passThruContent.sessionCount || 0);
            }
          }

          const currentAmountBrandLogoAndCustomColors = isFreeTrial ? 0 : subscription.SubscriptionPreference.data.brandLogoAndCustomColors;
          if (newPlan.brandLogoAndCustomColors === 0) {
            passThruContent.brandColorCount = 0;
          }
          if (currentAmountBrandLogoAndCustomColors === -1) {
            newPreferenceData.brandLogoAndCustomColors = -1;
          } else {
            if (newPreferenceData.brandLogoAndCustomColors !== -1 && /_annual_/.test(updatedSub.planId)) {
              newPreferenceData.brandLogoAndCustomColors = currentAmountBrandLogoAndCustomColors + (passThruContent.brandColorCount || 0);
            }
          }

          // recalc available resources
          newPreferenceData.availableSessions = calculateAvailableSessions(subscription, passThruContent);
          newPreferenceData.availableBrandColors = calculateAvailableBrandColors(subscription, passThruContent);

          return updatedSub.SubscriptionPreference.update({ data: newPreferenceData })
            .then((preference) => {
              return cleanupAfterUpdate(subscription.accountId, oldPlanId, passThruContent.planId)
            })
            .then(() => {
              return models.AccountUser.findOne({
                where: { AccountId: updatedSub.accountId, owner: true },
                include: [{ model: models.User }]
              });
            })
            .then((accountUser) => {
              let user = accountUser.User;
              return markPaidAccountInInfusion(user, subscription);
            })
            .then(() => {
              return { subscription: updatedSub, redirect: false };
            });
        })
    });

}

function cancelSubscription(subscriptionId, eventId, provider, chargebeeSub) {
  let deferred = q.defer();
  findPreferencesBySubscriptionId(subscriptionId).then(function(preference) {
    let subscription = preference.Subscription;
    disableSubDependencies(subscription.accountId, subscriptionId)
      .then(() => {
        let cancelledSubId = chargebeeSub.id;

        _.forEach(preference.data.availableSessions, (as) => {
          if (as.subscriptionId === cancelledSubId) {
            models.Session.update({ subscriptionId: null }, { where: { subscriptionId: as.subscriptionId } });
            as.endDate = new Date(chargebeeSub.current_term_end * 1000);
            as.sessionId = null;
          }
        });
        preference.data.sessionCount = PLAN_CONSTANTS.sessionCount(subscription);

        _.forEach(preference.data.availableBrandColors, (ac) => {
          if (ac.subscriptionId === cancelledSubId) {
            ac.endDate = new Date(chargebeeSub.current_term_end * 1000);
          }
        });
        if (preference.data.brandLogoAndCustomColors !== 0 && preference.data.brandLogoAndCustomColors !== -1) {
          preference.data.brandLogoAndCustomColors = preference.data.brandLogoAndCustomColors - chargebeeSub.plan_quantity;
        }

        return preference.update({ data: preference.data })
      })
      .then((updatedPreference) => {
        // check if there is at least one active subscription (endDate is in future)
        subscription.SubscriptionPreference = updatedPreference;
        let active = _.some(PLAN_CONSTANTS.availablePlans(subscription), (as) => moment().isBefore(as.endDate));
        if (active) {
          return;
        }
        // there is no active subscription - switch account to "free_account" plan
        const plan = buildCurrencyPlan('free_account', subscription.Account.currency);
        return updateSubscription({
          accountId: subscription.accountId,
          newPlanId: plan,
          skipCardCheck: true,
        }, provider);
      })
      .then(() => {
        deferred.resolve();
      })
      .catch((error) => {
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

function chargebeeSubCreateViaCheckout(params, subParams, redirectUrl, provider) {
  let passThruContent = JSON.stringify(params);
  // for tests only!
  if(!provider) {
    provider = chargebee.hosted_page.checkout_new;
  }

  const reqBody = {
    subscription: {
      plan_id: params.planId,
      plan_quantity: params.sessionCount || params.brandColorCount,
    },
    customer: subParams.customer,
    billing_address: subParams.billing_address,
    billing_cycles: subParams.billing_cycles,
    redirect_url: redirectUrl,
    cancel_url: redirectUrl,
    pass_thru_content: passThruContent,
    embed: 'false',
  };
  return new Bluebird((resolve, reject) => {
    provider(reqBody).request(function (error, result) {
      if (error) {
        reject(error);
      } else {
        resolve(result.hosted_page);
      }
    });
  });
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
 * @param {object} result
 * @param {models.Subscriptions} result.subscription
 * @param {object} subscription - subscription object from ChargeBee
 * @param {object} [resources]
 * @param {number} resources.sessionCount
 * @param {number} resources.brandColorCount
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
    brandColorCount: resources.brandColorCount,
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
 * @param {string[]} supportedCurrencies - array of supported currencies
 * @return {ChargeBeePlan[]}
 */
function filterSupportedPlans(plans, currencyData, supportedPlans, supportedCurrencies) {
  const plansRegex = new RegExp(`(${supportedPlans.join('|')})_(${supportedCurrencies.join('|')})$`, 'i');
  return plans.filter((item) => {
    const { plan } = item;
    return plansRegex.test(plan.id) && (!currencyData || plan.currency_code === currencyData.client);
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

/**
 * @param {Subscription} subscription
 * @param {string} subscription.subscriptionPlanId
 * @return {string}
 */
function getInfusionTagForSub(subscription) {
  let planName = _.lowerCase(PLAN_CONSTANTS.planName(subscription.planId));

  return InfusionSoft.TAGS.paidAccount[planName];
}

/**
 * @param {User} user
 * @param {string} user.email
 * @param {string} user.infusionEmail
 * @param {Subscription} subcription
 * @return {Promise.<T>}
 */
function markPaidAccountInInfusion(user, subcription) {
  let tag = getInfusionTagForSub(subcription);
  if (!user.infusionEmail || !tag) {
    return Promise.resolve();
  }

  return InfusionSoft.contact.find({ Email: user.email })
    .then((contact) => {
      if (!contact) {
        return;
      }

      return InfusionSoft.contact.tagAdd(contact.Id, tag);
    });
}
