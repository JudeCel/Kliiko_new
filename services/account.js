"use strict";
var Account  = require('./../models').Account;
var contactListService  = require('./contactList');
var _ = require('lodash');

function validate(params, callback) {
  let attrs = {name: params.accountName}
  Account.build(attrs).validate().done(function(errors, _account) {
    callback(errors, params);
  });
}

function create(params, user, callback) {
  Account.create({name: params.accountName}).then(function(result) {
    contactListService.createDefaultLists(result.id).then(function(_result) {
      callback(null, params, result, user);
    }, function(error) {
      callback(prepareErrors(error));
    });
  }).catch(Account.sequelize.ValidationError, function(err) {
    callback(prepareErrors(err));
  }).catch(function(err) {
    callback(prepareErrors(err));
  });
}

function updateInstance(account, params, callback) {
  account.update({ name: params.accountName }).then(function(result) {
    callback(null, true);
  }).catch(function(error) {
    callback(prepareErrors(error));
  });
}

function prepareErrors(err) {
  let errors = ({});
  _.map(err.errors, function (n) {
    errors[n.path] = _.startCase(n.path) + ':' + n.message.replace(n.path, '');
  });
  return errors;
};

module.exports = {
  validate: validate,
  create: create,
  updateInstance: updateInstance
}
