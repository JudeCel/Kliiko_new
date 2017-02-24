'use strict';

var models = require('./../../models');
var Account = models.Account;
var AccountUser = models.AccountUser;

var accountService = require('./../../services/account');
var userFixture = require('./../fixtures/user');
var testDatabase = require("../database");
var testData;

describe('SERVICE - Account', function() {
  beforeEach(function(done) {
    testDatabase.prepareDatabaseForTests().then(function() {
      userFixture.createUserAndOwnerAccount().then(function(result) {
        testData = result;
        done();
      }).catch(function(error) {
        done(error);
      });
    });
  });

  function sampleData() {
    return testData;
  }

  function testParams() {
    return {
      accountName: "newAccount"
    }
  }

  describe('#create new Account', function() {
    describe('happy path', function() {
      it('should create new account', function(done) {
        let params = testParams();
          accountService.createNewAccountIfNotExists(params, sampleData().user.id).then(function(result) {
            Account.find({ where: { name: params.accountName } }).then(function(account) {
              if (account) {
                AccountUser.find({ where: { AccountId: account.id, email: sampleData().user.email, UserId: sampleData().user.id, owner: true } }).then(function(accountUser) {
                  if (accountUser) {
                    done();
                  } else {
                    done('Should not get here!');
                  }
                });
              } else {
                done('Should not get here!');
              }
            });
          }, function(error) {
            done(error);
          });
      });
    });
  });

});
