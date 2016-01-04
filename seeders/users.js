'use strict';

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
    confirmedAt: new Date(),
    signInCount: 1
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
    confirmedAt: new Date(),
    signInCount: 1
  }
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
};

createUser();
