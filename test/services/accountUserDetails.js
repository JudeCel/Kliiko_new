"use strict";
var assert = require("chai").assert;
var models  = require('./../../models');
var usersServices = require('./../../services/users');
var AccountUserService  = require('./../../services/accountUser');

describe('Account User Service', () => {
  var testUser = null;
  var testAccount = null;
  var testAccountUser = null;
  
  var attrs = {
    accountName: "AlexS",
    firstName: "Alex",
    lastName: "Sem",
    password: "cool_password",
    email: "alex@gmail.com",
    gender: "male",
    mobile: "+1 123456789"
  }
    
  beforeEach(function(done) {
    models.sequelize.sync({ force: true }).then(() => {
      usersServices.create(attrs, function(errors, user) {
        testUser = user;
        user.getOwnerAccount().then(function(accounts) {
          user.getAccountUsers().then(function(results) {
            testAccountUser = results[0]
            testAccount = accounts[0];
            done();
          })
        });
      });
    });
  });
  
  describe('success ', function() {
    it('Change contact details', function (done) {
      AccountUserService.updateWithUserId(attrs, testUser.id, function(error) {
        assert.equal(error, null);
        done();
      });
    });
  });
  
  describe('failed ', () => {
    it('Change contact details, should fail', function (done) {
      attrs.mobile = "not valid number";
      AccountUserService.updateWithUserId(attrs, testUser.id, function(error) {
        if (error) {
          done();
        } else {
          done('Should not come here!');
        }
      });
    });
  });
   
});