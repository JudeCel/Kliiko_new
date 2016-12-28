'use strict';

var MessagesUtil = require('./../../util/messages');
var models = require('./../../models');
var filters = require('./../../models/filters');
var Subscription = models.Subscription;
var SubscriptionPreference = models.SubscriptionPreference;

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
    }
  },
  contactList: {
    key: 'contactListCount',
    model: models.ContactList,
    params: function(accountId) {
      return { where: { accountId: accountId, editable: true } };
    }
  },
  survey: {
    key: 'surveyCount',
    model: models.Survey,
    params: function(accountId) {
      return { where: { accountId: accountId, closed: false, confirmedAt: {$ne: null} } };
    }
  },
  topic: {
    key: 'topicCount',
    model: models.Topic,
    params: function(accountId) {
      return { where: { accountId: accountId, default: false } };
    }
  }
};

module.exports = {
  messages: MessagesUtil.validators.subscription,
  validate: validate,
  planAllowsToDoIt: planAllowsToDoIt,
  canAddAccountUsers: canAddAccountUsers,
  countMessage: countMessage,
  countRecruiterMessage: countRecruiterMessage,
  canChangeColorScheme: canChangeColorScheme
};

function canChangeColorScheme(subscription) {
  if (subscription) {
    if (subscription.dataValues.SubscriptionPreference.brandLogoAndCustomColors) {
      return { canChange: true };
    } else {
      let planName = _.capitalize(_.lowerCase(subscription.dataValues.planId));
      let error = MessagesUtil.validators.subscription.brandLogoAndColorSchemeLimit.replace('XXX', planName);
      return { error: error };
    }
  } else {
    return { canChange: true };
  }
}


function validate(accountId, type, count, params) {
  let deferred = q.defer();
  if (!params) {
    params = {};
  }

  validQuery(accountId).then(function(subscription) {
    if (subscription) {
      let dependency = DEPENDENCIES[type];
      if (dependency) {
        dependency.model.count(dependency.params(accountId, params.sessionId)).then(function(c) {
          let maxCount = subscription.SubscriptionPreference.data[dependency.key];

          if(c + count <= maxCount || maxCount == -1) {
            deferred.resolve(subscription);
          } else {
            if (type == "survey") {
              deferred.reject(countRecruiterMessage(subscription, maxCount));
            } else {
              deferred.reject(countMessage(type, maxCount));
            }
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

function planAllowsToDoIt(accountId, key) {
  let deferred = q.defer();

  validQuery(accountId).then(function(subscription) {
    if(subscription) {
      if(subscription.SubscriptionPreference.data[key]) {
        deferred.resolve();
      }
      else {
        deferred.reject(MessagesUtil.validators.subscription.planDoesntAllowToDoThis);
      }
    }
    else {
      deferred.resolve();
    }
  }, function(error) {
    deferred.reject(error);
  });

  return deferred.promise;
}

function canAddAccountUsers(accountId) {
  let deferred = q.defer();

  validQuery(accountId).then(function(subscription) {
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
          deferred.reject(countMessage("AccountUser", subscription.SubscriptionPreference.data.accountUserCount));
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

function validQuery(accountId) {
  let deferred = q.defer();

  models.Account.find({
    where: { id: accountId },
    include: [{
      model: Subscription,
      include: [SubscriptionPreference]
    }]
  }).then(function(account) {
    if(account) {
      if(account.admin) {
        deferred.resolve();
      }
      else if(account.Subscription) {
        if(account.Subscription.active) {
          deferred.resolve(account.Subscription);
        }
        else {
          deferred.reject(MessagesUtil.validators.subscription.inactiveSubscription);
        }
      }
      else {
        deferred.reject(MessagesUtil.validators.subscription.notFound);
      }
    }
    else {
      deferred.reject(MessagesUtil.validators.subscription.notFound);
    }
  });

  return deferred.promise;
}

function countMessage(type, maxCount) {
  let message = MessagesUtil.validators.subscription.countLimit;
  message = message.replace('XXX', _.startCase(type));
  message = message.replace('YYY', maxCount);
  return message;
}

function countRecruiterMessage(subscription, maxCount) {
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

  message = message.replace('YYY', maxCount);
  return { dialog: message };
}
