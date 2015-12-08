'use strict';
var Account  = require('./../../models').Account;
var User  = require('./../../models').User;

function findAllaccounts(callback) {
  Account.findAll({include: [User]})
  .then(function (result) {
    callback(result);
  });
}

function simpleParams(error, message) {
  if(typeof error == 'string') {
    error = { message: error };
  }

  return { title: 'Account Database', error: error, message: message, accounts: {} };
}


module.exports = {
  findAllaccounts: findAllaccounts,
  simpleParams: simpleParams
}
