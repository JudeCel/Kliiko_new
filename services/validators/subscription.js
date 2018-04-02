'use strict';

var MessagesUtil = require('./../../util/messages');
var models = require('./../../models');
var filters = require('./../../models/filters');
let subscriptionValidator = require('./hasValidSubscription');
var constants = require('./../../util/constants');

var Subscription = models.Subscription;
var SubscriptionPreference = models.SubscriptionPreference;
var bluebird = require('bluebird');

var q = require('q');
var _ = require('lodash');

const DEPENDENCIES = {
  session: {
    key: 'sessionCount',
    model: models.Session,
    params: function(accountId, sessionId) {
      return {
        where: {
            accountId: accountId,
            status: 'open',
            $or: [{ endTime: { $gt: new Date() } }, { publicUid: { $ne: null } }],
            id: { $ne: sessionId || null }
        },
        include: [{ model: models.Topic, required: false, where: { inviteAgain: true } }]
      };
    },
    countMessage: countMessage
  },
  contactList: {
    key: 'contactListCount',
    model: models.ContactList,
    params: function(accountId) {
      return { where: { accountId: accountId, editable: true, active: true } };
    },
    countMessage: countMessage
  },
  survey: {
    key: 'surveyCount',
    model: models.Survey,
    params: function(accountId) {
      return { where: { accountId: accountId, closed: false, confirmedAt: {$ne: null}, surveyType: {$ne: constants.surveyTypes.sessionPrizeDraw} } };
    },
    countMessage: countRecruiterMessage
  },
  topic: {
    key: 'topicCount',
    model: models.SessionTopics,
    params: function(accountId, sessionId) {
      return { where: { sessionId, active: true }, include:[{ model: models.Topic, where: { default: false, inviteAgain: false } }] };
    },
    countMessage: countMessage
  },
  countMessage: countMessage,
  brandLogoAndCustomColors:  {
    key: 'brandLogoAndCustomColors',
    model: models.BrandProjectPreference,
    params: function(accountId) {
      return {
        where: { accountId: accountId, default: false }
      };
    },
    countMessage: countMessage
  },
};

module.exports = {
  messages: MessagesUtil.validators.subscription,
  validate: validate,
  planAllowsToDoIt: planAllowsToDoIt,
  canAddAccountUsers: canAddAccountUsers,
  getTopicCount: getTopicCount,
  countMessage: countMessage,
  countRecruiterMessage: countRecruiterMessage
};

/**
 * @param {number} accountId
 * @param {string} type - one of ['session', 'contactList', 'survey', 'topic']
 * @param {number} count
 * @param {object} [params]
 * @return models.Subscription
 */
function validate(accountId, type, count, params) {
  let deferred = q.defer();
  if (!params) {
    params = {};
  }

  subscriptionValidator.validate(accountId).then(function(account) {
    let subscription = account.Subscription;
    if (subscription) {
      let dependency = DEPENDENCIES[type];
      if (dependency) {
        dependency.model.count(dependency.params(accountId, params.sessionId)).then(function(c) {
          let maxCount = subscription.SubscriptionPreference.data[dependency.key];

          if(c + count <= maxCount || maxCount == -1 || account.admin) {
            deferred.resolve(subscription);
          } else {
            deferred.reject(dependency.countMessage(type, maxCount, subscription));
          }
        }, function(error) {
          deferred.reject(filters.errors(error));
        });
      } else {
        deferred.reject(MessagesUtil.validators.subscription.notValidDependency);
      }
    } else {
      deferred.resolve(subscription);
    }
  }, function(error) {
    deferred.reject(error);
  });

  return deferred.promise;
}

function prepareErrorMessage(keyError, subscription) {
  let error = MessagesUtil.validators.subscription.error[keyError];
  if (error) {
    let planName = _.startCase(_.lowerCase(subscription.dataValues.planId));
    planName = planName.replace(new RegExp(constants.supportedCurrencies.join('|'), 'gi'), '');
    let newError = {
      name: "dialog",
      message: error.replace('_planName_', planName),
      title: 'Sorry'
    }
    return newError;
  } else {
    return MessagesUtil.validators.subscription.planDoesntAllowToDoThis;
  }
}

function planAllowsToDoIt(accountId, keys) {
  return new bluebird(function (resolve, reject) {
    if (Array.isArray(keys) == false) {
      keys = [keys];
    }

    subscriptionValidator.validate(accountId).then(function(account) {
      let subscription = account.Subscription;
      if(subscription) {
        let keyError;
        //finds only first feature that doesn't match
        _.find(keys, (key)=> {
          if(!subscription.SubscriptionPreference.data[key]) {
            keyError = key;
            return false;
          }
          return true;
        });

        if (keyError) {
          reject(prepareErrorMessage(keyError, subscription));
        } else {
          resolve(subscription);
        }
      }
      else {
        resolve();
      }
    }, function(error) {
      reject(error);
    });
  });
}

function getTopicCount(accountId, params) {
  return new bluebird((resolve, reject) => {
    let subscription, dependency = DEPENDENCIES.topic;
    subscriptionValidator.validate(accountId).then((account) => {
      subscription = account.Subscription;
      if(account.admin) {
        resolve({ count: 0, limit: -1 });
      }

      if(subscription) {
        return models.SessionTopics.count(dependency.params(accountId, params.sessionId));
      }
      else {
        resolve({ limit: -1 });
      }
    }).then((count) => {
      const limit = subscription.SubscriptionPreference.data[dependency.key];
      resolve({ count, limit });
    }).catch((error) => {
      reject(error);
    });
  });
}

function canAddAccountUsers(accountId) {
  let deferred = q.defer();

  subscriptionValidator.validate(accountId).then(function(account) {
    let subscription = account.Subscription;
    if(subscription) {
      models.AccountUser.count({
        where: {
          role: 'accountManager',
          isRemoved: false
        },
        include: [{
          model: models.Account,
          where: {
            id: accountId,
            admin: false
          }
        }]
      }).then(function(count) {
        if(canAddManager(subscription.SubscriptionPreference.data.accountUserCount, count)) {
          deferred.resolve();
        }else{
          deferred.reject({dialog: MessagesUtil.validators.subscription.error.accountUserCount, title: 'Sorry'});
        }
      }).catch(function(error) {
        deferred.reject(error);
      });
    }
    else {
      deferred.resolve();
    }
  }, function(error) {
    deferred.reject(error);
  });

  return deferred.promise;
}

function canAddManager(allowedBySubscription, currentManagerCount) {
  return allowedBySubscription == -1 || allowedBySubscription > currentManagerCount;
}

function countMessage(type, maxCount) {
  let message = MessagesUtil.validators.subscription.countLimit;
  message = message.replace('_name_', _.startCase(type));
  message = message.replace('ss (', 's (');
  message = message.replace('_max_number_', maxCount);
  return message;
}

function countRecruiterMessage(type, maxCount, subscription) {
  let subscriptionType = 'free_trial';
  if (subscription) {
    subscriptionType = subscription.dataValues.planId;
  }

  let message = MessagesUtil.validators.subscription.recruiterCountLimitJunior_Trial;
  if (_.includes(subscriptionType, 'free_')) {
    if (_.includes(subscriptionType, 'trial')) {
      message = MessagesUtil.validators.subscription.recruiterCountLimitJunior_Trial + "Free Trial Plan";
    } else {
      message = MessagesUtil.validators.subscription.recruiterCountLimitJunior_Trial + "Free Account Plan";
    }
  } else if (_.includes(subscriptionType, 'junior_')) {
    message = MessagesUtil.validators.subscription.recruiterCountLimitJunior_Trial + "Junior Plan";
  } else if (_.includes(subscriptionType, 'core_')) {
    message = MessagesUtil.validators.subscription.recruiterCountLimitCore;
  } else if (_.includes(subscriptionType, 'senior_')) {
    message = MessagesUtil.validators.subscription.recruiterCountLimitSenior;
  } else if (_.includes(subscriptionType, 'essentials_')) {
    message = MessagesUtil.validators.subscription.recruiterCountLimitEssentials;
  }

  message = message.replace('_max_number_', maxCount);
  return { dialog: message, title: 'Sorry' };
}
