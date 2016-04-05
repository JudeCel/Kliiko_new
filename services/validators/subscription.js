'use strict';

var models = require('./../../models');
var filters = require('./../../models/filters');
var Subscription = models.Subscription;
var SubscriptionPreference = models.SubscriptionPreference;

var q = require('q');
var _ = require('lodash');

const MESSAGES = {
  notFound: 'No subscription found',
  notValidDependency: 'Not valid dependency',
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
  }
};

module.exports = {
  messages: MESSAGES,
  validate: validate
};

function validate(accountId, type, count) {
  let deferred = q.defer();

  SubscriptionPreference.find({
    include: [{
      model: Subscription,
      where: {
        accountId: accountId
      }
    }]
  }).then(function(preference) {
    if(preference) {
      let dependency = DEPENDENCIES[type];
      if(dependency) {
        dependency.model.count(dependency.params(accountId)).then(function(c) {
          let maxCount = preference.data[dependency.key];

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
      deferred.reject(MESSAGES.notFound);
    }
  }).catch(function(error) {
    deferred.reject(filters.errors(error));
  });

  return deferred.promise;
}
