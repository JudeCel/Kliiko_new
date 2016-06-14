'use strict';

var models = require('./../../models');
var AccountUser = models.AccountUser;
var SessionMember = models.SessionMember;

var myDashboardServices = require('./../../services/myDashboard');
var userFixture = require('./../fixtures/user');
var sessionFixture = require('./../fixtures/session');
var subscriptionFixture = require('./../fixtures/subscription');
var assert = require('chai').assert;
var _ = require('lodash');

describe('SERVICE - MyDashboard', function() {
  var testData;

  afterEach(function(done) {
    models.sequelize.sync({ force: true }).then(function() {
      done();
    });
  });

  describe('#getAllAccountUsers', function() {
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

    describe('happy path', function() {
      it('should succeed on finding one of each role', function(done) {
        userFixture.createMultipleAccountUsers(['observer', 'facilitator'], testData).then(function() {
          myDashboardServices.getAllAccountUsers(testData.user.id, 'http').then(function(result) {
            assert.equal(result.accountManager.data.length, 1);
            assert.equal(result.observer.data.length, 1);
            assert.equal(result.facilitator.data.length, 1);
            done();
          }, function(error) {
            done(error);
          });
        }, function(error) {
          done(error);
        });
      });

      it('should succeed on finding one of each except facilitator', function(done) {
        userFixture.createMultipleAccountUsers(['observer'], testData).then(function() {
          myDashboardServices.getAllAccountUsers(testData.user.id, 'http').then(function(result) {
            assert.equal(result.accountManager.data.length, 1);
            assert.equal(result.observer.data.length, 1);
            assert.equal(result.facilitator, undefined);
            done();
          }, function(error) {
            done(error);
          });
        }, function(error) {
          done(error);
        });
      });
    });
  });

  describe('#getAllSessions', function() {
    beforeEach(function(done) {
      sessionFixture.createChat().then(function(result) {
        testData = result;
        subscriptionFixture.createSubscription(testData.account.id, testData.user.id).then(function(subscription) {
          testData.subscription = subscription;

          models.SubscriptionPreference.update({'data.sessionCount': 5}, { where: { subscriptionId: subscription.id } }).then(function() {
            done();
          }, function(error) {
            done(error);
          });
        }, function(error) {
          done(error);
        });
      }, function(error) {
        done(error);
      });
    });

    describe('happy path', function() {
      it('should succeed on finding session for current user as participant', function(done) {
        function provider(params) {
          return {
            request: function(callback) {
              callback(null, { subscription: {} });
            }
          }
        }

        myDashboardServices.getAllSessions(testData.user.id, provider).then(function(sessions) {
          assert.equal(sessions[0].id, testData.session.id);
          done();
        }, function(error) {
          done(error);
        });
      });
    });

    describe('sad path', function() {
      it('should fail on finding session because not a member to session', function(done) {
        function successProvider(params) {
          return function() {
            return {
              request: function(callback) {
                callback(null, {
                  subscription: { id: params.subscriptionId, plan_id: params.planId },
                  customer: { id: params.customerId }
                });
              }
            }
          }
        }

        let invalidId = 9876;

        myDashboardServices.getAllSessions(invalidId, successProvider(testData.subscription)).then(function(sessions) {
          assert.deepEqual(sessions, []);
          done();
        }, function(error) {
          done(error);
        });
      });
    });
  });

});
