'use strict';

var models = require('./../../models');
var AccountUser = models.AccountUser;

var filtersMiddleware = require('./../../middleware/filters');
var userFixture = require('./../fixtures/user');
var assert = require('chai').assert;

describe('MIDDLEWARE - Filters', function() {
  var testData;

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

  afterEach(function(done) {
    models.sequelize.sync({ force: true }).then(function() {
      done();
    });
  });

  describe('#myDashboardPage', function() {
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
      it('should succeed on redirecting to my dashboard', function (done) {
        userFixture.createMultipleAccountUsers(['observer'], testData).then(function() {
          filtersMiddleware.myDashboardPage(reqObject(), resObject('my-dashboard', done));
        }, function(error) {
          done(error);
        });
      });

      it('should succeed on redirecting to only account', function (done) {
        filtersMiddleware.myDashboardPage(reqObject(), resObject(testData.account.name, done));
      });
    });
  });

});
