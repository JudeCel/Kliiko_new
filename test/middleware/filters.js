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

  afterEach(function(done) {
    models.sequelize.sync({ force: true }).then(function() {
      done();
    });
  });

  describe('#myDashboardPage', function() {
    beforeEach(function(done) {
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

    function reqObject() {
      return {
        user: {
          id: testData.user.id
        },
        protocol: 'http'
      }
    }

    function resObject(matcher, done) {
      return {
        redirect: function(url) {
          assert.include(url, matcher);
          done();
        }
      }
    }

    describe('happy path', function() {
      it('should succeed on redirecting to my dashboard', function(done) {
        userFixture.createMultipleAccountUsers(['observer'], testData).then(function() {
          filtersMiddleware.myDashboardPage(reqObject(), resObject('my-dashboard', done));
        }, function(error) {
          done(error);
        });
      });

      it('should succeed on redirecting to only account', function(done) {
        filtersMiddleware.myDashboardPage(reqObject(), resObject(testData.account.name, done));
      });
    });
  });

  describe('#planSelectPage', function() {
    beforeEach(function(done) {
      subscriptionFixture.createSubscription().then(function(result) {
        testData = result;
        done();
      }, function(error) {
        done(error);
      });
    });

    function reqObject(path) {
      return {
        originalUrl: path || 'someUrl',
        user: {
          id: testData.user.id
        },
        protocol: 'http'
      }
    }

    function resObject(matcher, done, accountId) {
      return {
        locals: {
          currentDomain: { id: accountId || testData.account.id, name: testData.account.name, roles: ['accountManager'] }
        },
        redirect: function(url) {
          assert.include(url, matcher);
          done();
        }
      }
    }

    describe('happy path', function() {
      it('should succeed on redirecting to select plan page', function(done) {
        filtersMiddleware.planSelectPage(reqObject(), resObject('selectPlan', done, testData.account.id + 100));
      });

      it('should succeed on skipping this check because path matches', function(done) {
        filtersMiddleware.planSelectPage(reqObject('/dashboard/selectPlan'), resObject(), function() {
          done();
        });
      });

      it('should succeed on skipping this check because subscription already exists', function(done) {
        filtersMiddleware.planSelectPage(reqObject(), resObject(), function() {
          done();
        });
      });
    });
  });

});
