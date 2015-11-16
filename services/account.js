"use strict";
var Account  = require('./../models').Account;

function validate(params, callback) {
  Account.find({attributes: ['name'], where: { name: params.accountName } }).then(function (account) {
    if(account){
      let errors = {accountName:" Account already taken " }
      callback(errors, params)
    }else{
      callback(null, params)
    };
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
