'use strict';

var models = require('./../../models');
var AccountUser = models.AccountUser;
var Subscription = models.Subscription;

var filtersMiddleware = require('./../../middleware/filters');
var userFixture = require('./../fixtures/user');
var subscriptionFixture = require('./../fixtures/subscription');
var assert = require('chai').assert;

describe('MIDDLEWARE - Filters', function() {
  var testData;

  describe('#myDashboardPage', function() {
    beforeEach(function(done) {
      models.sequelize.sync({ force: true }).then(function() {
        userFixture.createUserAndOwnerAccount().then(function(result) {
          testData = result;
          AccountUser.find({ where: { UserId: result.user.id, AccountId: result.account.id } }).then(function(accountUser) {
            testData.accountUser = accountUser;
            done();
          });
        }, function(error) {
          done(error);
        });
      });
    });

    function reqObject(account) {
      return {
        user: {
          id: testData.user.id
        },
        protocol: 'http',
        session: { landed: false }
      }
    }

    function resObject(matcher, done) {
      return {
        redirect: function(url) {
          try {
            assert.include(url, matcher);
            done();
          } catch (e) {
            done(e);
          }
        }
      }
    }

    describe('happy path', function() {
      it('should succeed on redirecting to my dashboard', function(done) {
        userFixture.createMultipleAccountUsers(['observer'], testData).then(function() {
          filtersMiddleware.myDashboardPage(reqObject(), resObject('account-hub', done));
        }, function(error) {
          done(error);
        });
      });

      it('should succeed on redirecting to only account', function(done) {
        filtersMiddleware.myDashboardPage(reqObject(), resObject(testData.account.name.toLowerCase(), done));
      });
    });
  });

  describe('#planSelectPage', function() {
    beforeEach(function(done) {
      models.sequelize.sync({ force: true }).then(function() {
        subscriptionFixture.createSubscription().then(function(result) {
          testData = result;
            AccountUser.find({ where: { UserId: result.user.id, AccountId: result.account.id } }).then(function(accountUser) {
              testData.accountUser = accountUser;
              done();
            });
        }, function(error) {
          done(error);
        });
      });
    });

    function reqObject(path, account, accountUser) {
      return {
        originalUrl: path || 'someUrl',
        user: {
          id: testData.user.id
        },
        currentResources: { 
          account: {name: account.name, id: account.id}, 
          accountUser: {id: accountUser.id, role: accountUser.role}  
        },
        protocol: 'http',
        session: { landed: false }
      }
    }

    function resObject(matcher, done) {
      return {
        redirect: function(url) {
          try {
            assert.include(url, matcher);
            done();
          } catch (e) {
            done(e);
          }

        },
        send: function(resp) {
          try {
            assert.equal(resp.error, "No account found.");
            done();
          } catch (e) {
            done(e);
          }
        }
      }
    }

    describe('happy path', function() {
      it('should succeed on redirecting to landing page', function(done) {
        models.Subscription.destroy({where: {accountId: testData.account.id}}).then(function() {
          filtersMiddleware.planSelectPage(reqObject(null, testData.account, testData.accountUser), resObject('account-hub/landing', done));
        })
      });

      it('should succeed on skipping this check because path matches', function(done) {
        filtersMiddleware.planSelectPage(reqObject('/account-hub/selectPlan', testData.account, testData.accountUser), resObject(), function() {
          done();
        });
      });

      it('should succeed on skipping this check because subscription already exists', function(done) {
        filtersMiddleware.planSelectPage(reqObject(null, testData.account, testData.accountUser), resObject(), function() {
          done();
        });
      });
    });

    describe('sad path', function() {
      it('should succeed on redirecting to select plan page', function(done) {
        let account = {id: (testData.account.id + 100), name: testData.account.name}
        filtersMiddleware.planSelectPage(reqObject(null, account, testData.accountUser), resObject('selectPlan', done));
      });
    });
  });
});
