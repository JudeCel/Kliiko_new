'use strict';

var q = require('q');
var async = require('async');

var models = require('./../../models');
var subscriptionFixture = require('./../fixtures/subscription');
var subscriptionPlansFixture = require('./../fixtures/subscriptionPlans');
var subscriptionService = require('./../../services/subscription');

module.exports = {
  fill: fill
};

function fill(user, roles) {
  let deferred = q.defer();

  subscriptionPlansFixture.createPlans().then(function() {
    let array = roles.map(function(role) {
      return function(callback) { eachRole(user, role, callback); }
    });

    async.parallel(array, function(error) {
      if(error) {
        deferred.reject(error);
      }
      else {
        deferred.resolve();
      }
    });
  }, function(error) {
    deferred.reject(error);
  });

  return deferred.promise;
}

function eachRole(user, role, callback) {
  let account, accountUser, session;

  models.Account.create({ name: role }).then(function(result) {
    account = result;
    return models.AccountUser.create({
      UserId: user.id,
      AccountId: account.id,
      firstName: 'firstName',
      lastName: 'lastName',
      gender: 'male',
      email: user.email,
      role: role
    });
  }).then(function(result) {
    accountUser = result;
    return createSubscription(account.id, user.id);
  }).then(function(result) {
    return models.Session.create({ accountId: account.id, timeZone: 'Europe/Riga' });
  }).then(function(result) {
    session = result;
    return models.SessionMember.create({
      sessionId: session.id,
      accountUserId: accountUser.id,
      username: role,
      colour: 'red',
      role: role
    });
  }).then(function(result) {
    callback();
  }).catch(function(error) {
    callback(error);
  });
}

function createSubscription(accountId, userId) {
  return subscriptionService.createSubscription(accountId, userId, subscriptionFixture.successProvider({ id: 'RandomUniqueId666' + accountId + userId }));
}
