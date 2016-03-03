'use strict';

var models = require('./../../models');
var Subscription = models.Subscription;

var subscriptionServices = require('./../../services/subscription');
var userFixture = require('./../fixtures/user');

var assert = require('chai').assert;

describe('SERVICE - Subscription', function() {
  var testData;

  beforeEach(function(done) {
    userFixture.createUserAndOwnerAccount().then(function(result) {
      testData = result;
      done();
    }, function(error) {
      done(error);
    });
  });

  afterEach(function(done) {
    models.sequelize.sync({ force: true }).then(function() {
      done();
    });
  });

  function successProvider(params) {
    return function() {
      return {
        request: function(callback) {
          callback(null, { subscription: { id: params.id, plan_id: 'free' } });
        }
      }
    }
  }

  describe('#createSubscription', function() {
    describe('happy path', function() {
      it('should succeed on creating subscription', function(done) {
        subscriptionServices.createSubscription(testData.account.id, testData.user.id, successProvider({ id: 'SomeUniqueID' })).then(function(subscription) {
          assert.isNotNull(subscription);
          assert.equal(subscription.accountId, testData.account.id);
          done();
        }, function(error) {
          done(error);
        });
      });
    });

    describe('sad path', function() {
      function errorProvider(error) {
        return function() {
          return {
            request: function(callback) {
              callback({ errors: [{ path: 'error', message: error }] });
            }
          }
        }
      }

      it('should fail because chargebee raises error', function(done) {
        subscriptionServices.createSubscription(testData.account.id, testData.user.id, errorProvider('some error')).then(function() {
          done('Should not get here!');
        }, function(error) {
          assert.deepEqual(error, { error: 'some error' });
          done();
        });
      });

      it('should fail because account user not found', function(done) {
        subscriptionServices.createSubscription(testData.account.id + 100, testData.user.id, errorProvider('some error')).then(function() {
          done('Should not get here!');
        }, function(error) {
          assert.equal(error, subscriptionServices.messages.notFound.accountUser);
          done();
        });
      });

      it('should fail because subscription already exists', function(done) {
        subscriptionServices.createSubscription(testData.account.id, testData.user.id, successProvider({ id: 'SomeUniqueID' })).then(function() {
          subscriptionServices.createSubscription(testData.account.id, testData.user.id, successProvider({ id: 'SomeUniqueID' })).then(function() {
            done('Should not get here!');
          }, function(error) {
            assert.equal(error, subscriptionServices.messages.alreadyExists);
            done();
          });
        });
      });

      it('should fail because subscription has invalid params', function(done) {
        subscriptionServices.createSubscription(testData.account.id, testData.user.id, successProvider({ id: null })).then(function() {
          done('Should not get here!');
        }, function(error) {
          assert.deepEqual(error, { subscriptionId: "Subscription Id can't be empty" });
          done();
        });
      });
    });
  });

  describe('#findSubscription', function() {
    describe('happy path', function() {
      beforeEach(function(done) {
        subscriptionServices.createSubscription(testData.account.id, testData.user.id, successProvider({ id: 'SomeUniqueID' })).then(function() {
          done();
        }, function(error) {
          done(error);
        });
      });

      it('should succeed on finding subscription', function(done) {
        subscriptionServices.findSubscription(testData.account.id).then(function(subscription) {
          assert.isNotNull(subscription);
          assert.equal(subscription.accountId, testData.account.id);
          done();
        }, function(error) {
          done(error);
        });
      });
    });

    describe('sad path', function() {
      it('should fail because no subscription for this account', function(done) {
        subscriptionServices.findSubscription(testData.account.id).then(function(subscription) {
          assert.isNull(subscription);
          done();
        }, function(error) {
          done(error);
        });
      });
    });
  });

});
