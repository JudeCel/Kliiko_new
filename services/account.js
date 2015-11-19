"use strict";
var Account  = require('./../models').Account;

function validate(params, callback) {
  let attrs = {name: params.accountName}
  Account.build(attrs).validate().done(function(errors, _account) {
    callback(errors, params);
  });
}

function create(params, user, callback) {
  Account.create({name: params.accountName}).then(function(result) {
    callback(null, result, user);
  }).catch(Account.sequelize.ValidationError, function(err) {
    callback(err);
  }).catch(function(err) {
    callback(err);
  });
}

module.exports = {
  validate: validate,
  create: create
}
