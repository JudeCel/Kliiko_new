"use strict";
var User  = require('./../models').User;
var Account  = require('./../models').Account;
var AccountUser  = require('./../models').AccountUser;
var _ = require('lodash');

function create(account, user, callback) {
  let attrs = { "accountId": account.id, "userId": user.id, "rools": "accountManager"}
  AccountUser.create(attrs).then(function(result) {
    callback(null, user);
  }).catch(AccountUser.sequelize.ValidationError, function(err) {
    callback(err);
  }).catch(function(err) {
    callback(err);
  });
}
module.exports = {
  create: create
}
