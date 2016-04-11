'use strict';
require('dotenv-extended').load({
  errorOnMissing: true
});
var productionEnvMapper = require("./util/productionEnvMapper")

// Maps Kubernetes specific values to Local values
productionEnvMapper.map();

var UserService = require('./../services/users');
var async = require('async');

let createNewUserFunctionList = [
  (cb) => {createAdmin(cb)},
  crateAccountManager
]

function createAdmin(callback) {
  let adminAttrs = {
    accountName: "admin",
    firstName: "admin",
    lastName: "user",
    password: "qwerty123",
    email: "admin@insider.com",
    gender: "male",
    phoneCountryData: {name: "Australia", iso2: "au", dialCode: "61"},
    landlineNumberCountryData: {name: "Australia", iso2: "au", dialCode: "61"},
    confirmedAt: new Date()
  }

  UserService.create(adminAttrs, function(errors, user) {
    if(errors) {
      return callback(errors)
    }
    user.getOwnerAccount().then(function(results) {
      let account = results[0].AccountUser;
      if (account) {
        account.update({ role: 'admin' });
        callback(null)
      }else{
        callback("Account not found for user")
      }
    }).catch(function(err) {
      callback(err);
    });
  });
}

function crateAccountManager(callback) {
  let userAttrs = {
    accountName: "user",
    firstName: "insider",
    lastName: "user",
    password: "qwerty123",
    email: "user@insider.com",
    gender: "male",
    phoneCountryData: {name: "Australia", iso2: "au", dialCode: "61", priority: 0, areaCodes: null},
    confirmedAt: new Date()
  };
  UserService.create(userAttrs, function(errors, user) {
    callback(errors, user);
  });
}

function createUser() {
  async.waterfall(createNewUserFunctionList, function (error, _result) {
    if (error) {
      console.log("wee get error:" + error);
      process.exit();
    }
    console.log("Done!!");
    process.exit();
  });
}

createUser();
