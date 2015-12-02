"use strict";
var User  = require('./../models').User;
var Account  = require('./../models').Account;
var AccountUser  = require('./../models').AccountUser;
var _ = require('lodash');

function create(account, user, callback) {
    user.addAccount(account, { role: 'accountManager', owner: true}).then(function(result) {
      return callback(null, user);
    }).catch(AccountUser.sequelize.ValidationError, function(err) {
      return callback(err);
    }).catch(function(err) {
      return callback(err);
    });
}

function createWithRole(account, user, role, callback) {
    user.addAccount(account, { role: role, owner: false }).then(function(result) {
      return callback(null, user);
    }).catch(AccountUser.sequelize.ValidationError, function(err) {
      return callback(err);
    }).catch(function(err) {
      return callback(err);
    });
}

module.exports = {
  create: create,
  createWithRole: createWithRole
}
