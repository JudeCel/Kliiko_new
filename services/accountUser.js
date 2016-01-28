'use strict';

var models = require('./../models');
var AccountUser = models.AccountUser;
var _ = require("lodash");

function create(params, account, user, t, callback) {
  AccountUser.create(prepareParams(params, account, user), { transaction: t })
  .then(function(result) {
    return callback(null, user, params, t);
  }).catch(AccountUser.sequelize.ValidationError, function(err) {
    return callback(err, null, null, t);
  }).catch(function(err) {
    return callback(err, null, null, t);
  });
}

function prepareParams(params, account, user) {
  let  defaultStruct = {
    role: 'accountManager',
    owner: true,
    AccountId: account.id,
    UserId: user.id
  }
  return _.merge(params, defaultStruct);
}


module.exports = {
  create: create
}
