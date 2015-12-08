'use strict';

var models  = require('./../../models');
var userService  = require('./../../services/users');
var accountUserService  = require('./../../services/accountUser');
var assert = require('chai');

describe('Account user service', function() {
  var testUser1 = null;
  var testUser2 = null;
  var testAccount = null;

  before(function(done) {
    var attrs = {
      accountName: "Lauris",
      firstName: "Lauris",
      lastName: "Blīgzna",
      password: "multipassword",
      email: "bligzna.lauris@gmail.com",
      gender: "male"
    }
    models.sequelize.sync({ force: true }).then(() => {
      userService.create(attrs, function(error, user) {
        testUser1 = user;

        attrs.accountName = "blauris";
        attrs.email = "bligzna1.lauris@gmail.com";
        userService.create(attrs, function(error, user) {
          testUser2 = user;
          user.getOwnerAccount().done(function(accounts) {
            testAccount = accounts[0];
            done();
          })
        });
      });
    });
  });

  after(function(done) {
    models.sequelize.sync({ force: true }).then(() => {
      done();
    });
  });

  it('#createNotOwner', function (done) {
    accountUserService.createNotOwner(testAccount, testUser1, function(error, user) {
      console.log(error);
      testUser1.getAccounts().then(function(result) {
        console.log(result);
        // assert.include(result, user);
        done();
      });
    });
  });
});
