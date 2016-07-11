'use strict';

var models = require('./../../models');
var filters = require('./../../models/filters');
var Subscription = models.Subscription;
var SubscriptionPreference = models.SubscriptionPreference;

var q = require('q');
var _ = require('lodash');

const MESSAGES = {
  planDoesntAllowToDoThis: 'Please update your subscription plan to one that includes this feature.',
  notFound: 'No subscription found',
  notValidDependency: 'Not valid dependency',
  inactiveSubscription: 'Your subscription is expired, please update your subscription plan.',
  count: function(type, maxCount) {
    return `You have reached limit for ${_.startCase(type)}s (max: ${maxCount})`
  }
};

const DEPENDENCIES = {
  session: {
    key: 'sessionCount',
    model: models.Session,
    params: function(accountId) {
      return { where: { accountId: accountId } };
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
      return { where: { accountId: accountId } };
    }
  },
  topic: {
    key: 'topicCount',
    model: models.Topic,
    params: function(accountId) {
      return { where: { accountId: accountId } };
    }
  }
};

module.exports = {
  messages: MESSAGES,
  validate: validate,
  planAllowsToDoIt: planAllowsToDoIt,
  canAddAccountUsers: canAddAccountUsers
};

function validate(accountId, type, count) {
  let deferred = q.defer();

  validQuery(accountId).then(function(subscription) {
    if(subscription) {
      let dependency = DEPENDENCIES[type];
      if(dependency) {
        dependency.model.count(dependency.params(accountId)).then(function(c) {
          let maxCount = subscription.SubscriptionPreference.data[dependency.key];

          if(c + count <= maxCount || maxCount == -1) {
            deferred.resolve();
          }
          else {
            deferred.reject(MESSAGES.count(type, maxCount));
          }
        }, function(error) {
          deferred.reject(filters.errors(error));
        });
      }
      else {
        deferred.reject(MESSAGES.notValidDependency);
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

function planAllowsToDoIt(accountId, key) {
  let deferred = q.defer();

  validQuery(accountId).then(function(subscription) {
    if(subscription) {
      if(subscription.SubscriptionPreference.data[key]) {
        deferred.resolve();
      }
      else {
        deferred.reject(MESSAGES.planDoesntAllowToDoThis);
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
          deferred.reject(MESSAGES.count('AccountUser', subscription.SubscriptionPreference.data.accountUserCount));
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
          deferred.reject(MESSAGES.inactiveSubscription);
        }
      }
      else {
        deferred.reject(MESSAGES.notFound);
      }
    }
    else {
      deferred.reject(MESSAGES.notFound);
    }
  });

  return deferred.promise;
}
