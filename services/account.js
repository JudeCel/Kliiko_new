'use strict';

var models = require('./../models')
var Account  = models.Account;
var filters = require('./../models/filters');
var contactListService  = require('./contactList');
var brandColourService  = require('./brandColour');
var _ = require('lodash');
var q = require('q');

function create(object, callback) {
  object.account = {};
  object.errors = object.errors || {};

  Account.create({ name: object.params.accountName, selectedPlanOnRegistration: object.params.selectedPlanOnRegistration }, { transaction: object.transaction }).then(function(result) {
    contactListService.createDefaultLists(result.id, object.transaction).then(function(contactLists) {
      brandColourService.createDefaultForAccount({ accountId: result.id, name: 'Default scheme', colours: {} }, object.transaction).then(function() {
        object.account = result;
        object.contactLists = contactLists.results;
        callback(null, object);
      }, function(error) {
        _.merge(object.errors, filters.errors(error));
        callback(null, object);
      });
    }, function(error) {
      _.merge(object.errors, filters.errors(error));
      callback(null, object);
    });
  }, function(error) {
    _.merge(object.errors, filters.errors(error));
    callback(null, object);
  });
}

function updateInstance(account, params, callback) {
  account.update({ name: params.accountName }).then(function(result) {
    callback(null, true);
  }).catch(function(error) {
    callback(filters.errors(error));
  });
}

function findWithSubscription(accountId) {
  let deferred = q.defer();

  Account.find({
    where: {
      id: accountId,
    },
    include: [models.Subscription]
  }).then(function(result) {
    deferred.resolve(result);
  }, function(error) {
    deferred.reject(error);
  });

  return deferred.promise;
}

module.exports = {
  create: create,
  updateInstance: updateInstance,
  findWithSubscription: findWithSubscription
}
