'use strict';
require('dotenv-extended').load({
  errorOnMissing: true
});

var UserService = require('./../services/users');
var resourcesService = require('./../services/resources');
var Constants = require('./../util/constants');
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
      results[0].update({ admin: true }).then(function() {
        let account = results[0].AccountUser;
        if (account) {
          account.update({ role: 'admin' });
          resourcesService.addDefaultTopicVideo(account, Constants.defaultTopic.video.focus, "Focus").then(function() {
            resourcesService.addDefaultTopicVideo(account, Constants.defaultTopic.video.forum, "Forum").then(function() {
              callback(null);
            }, function(error) {
              callback(error);
            });
          }, function(error) {
            callback(error);
          });
        }else{
          callback("Account not found for user")
        }
      });
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
      console.log("wee get error:", error);
      process.exit();
    }
    console.log("Done!!");
    process.exit();
  });
}

createUser();
