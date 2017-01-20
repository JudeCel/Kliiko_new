'use strict';

var MessagesUtil = require('./../../util/messages');
var models = require('./../../models');
var filters = require('./../../models/filters');
let subscriptionValidator = require('./hasValidSubscription');

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
          endTime: { $gt: new Date() },
          id: { $ne: sessionId || null }
        }
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
      return { where: { accountId: accountId, closed: false, confirmedAt: {$ne: null} } };
    },
    countMessage: countRecruiterMessage
  },
  topic: {
    key: 'topicCount',
    model: models.Topic,
    params: function(accountId) {
      return { where: { accountId: accountId, default: false } };
    }
  },
  countMessage: countMessage
};

module.exports = {
  messages: MessagesUtil.validators.subscription,
  validate: validate,
  planAllowsToDoIt: planAllowsToDoIt,
  canAddAccountUsers: canAddAccountUsers,
  countMessage: countMessage,
  countRecruiterMessage: countRecruiterMessage
};

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

          if(c + count <= maxCount || maxCount == -1) {
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
          resolve();
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

function canAddAccountUsers(accountId) {
  let deferred = q.defer();

  subscriptionValidator.validate(accountId).then(function(account) {
    let subscription = account.Subscription;
    if(subscription) {
      models.AccountUser.count({
        where: {
          role: 'accountManager'
        },
        include: [{
          model: models.Account,
          where: {
            id: accountId
          }
        }]
      }).then(function(count) {
        if(subscription.SubscriptionPreference.data.accountUserCount <= count) {
          deferred.reject({dialog: MessagesUtil.validators.subscription.error.accountUserCount, title: 'Sorry'});
        }else{
          deferred.resolve();
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

function countMessage(type, maxCount) {
  let message = MessagesUtil.validators.subscription.countLimit;
  message = message.replace('_name_', _.startCase(type));
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
  }

  message = message.replace('_max_number_', maxCount);
  return { dialog: message, title: 'Sorry' };
}
