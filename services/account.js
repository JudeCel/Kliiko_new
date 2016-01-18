"use strict";
var Account  = require('./../models').Account;
var _ = require('lodash');

function validate(params, callback) {
  let attrs = {name: params.accountName}
  Account.build(attrs).validate().done(function(errors, _account) {
    callback(errors, params);
  });
}

function create(params, user, t, callback) {
  Account.create({name: params.accountName}, { transaction: t } ).then(function(result) {
    callback(null, params, result, user, t);
  }).catch(Account.sequelize.ValidationError, function(err) {
    callback(err, null, null, null, t);
  }).catch(function(err) {
    callback(err, null, null, null, t);
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
    if (!errors[n.path]) {
      errors[n.path] = n.message;
    }
  });
  return errors;
};

module.exports = {
  validate: validate,
  create: create,
  updateInstance: updateInstance
}
