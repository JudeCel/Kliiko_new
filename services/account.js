'use strict';

var Account  = require('./../models').Account;
var filters = require('./../models/filters');
var contactListService  = require('./contactList');
var _ = require('lodash');

function create(object, callback) {
  object.account = {};
  object.errors = object.errors || {};

  Account.create({ name: object.params.accountName }, { transaction: object.transaction }).then(function(result) {
    contactListService.createDefaultLists(result.id, object.transaction).then(function(_promise) {
      object.account = result;
      callback(null, object);
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

module.exports = {
  create: create,
  updateInstance: updateInstance
}
