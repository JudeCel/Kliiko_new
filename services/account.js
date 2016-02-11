'use strict';

var Account  = require('./../models').Account;
var filters = require('./../models/filters');
var contactListService  = require('./contactList');
var _ = require('lodash');

function validate(params, callback) {
  let attrs = {name: params.accountName}
  Account.build(attrs).validate().done(function(errors, _account) {
    callback(errors, params);
  });
}

function create(params, user, t, callback) {
  Account.create({name: params.accountName}, { transaction: t }).then(function(result) {
    contactListService.createDefaultLists(result.id, t).then(function(promiss) {
      callback(null, params, result, user, promiss.transaction);
    }, function(error, t) {
      callback(error, null, null, null, t);
    });
  }).catch(Account.sequelize.ValidationError, function(err) {
    callback(err, null, null, null, t);
  }).catch(function(err) {
    callback(err, null, null, null, err.transaction);
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
  validate: validate,
  create: create,
  updateInstance: updateInstance
}
