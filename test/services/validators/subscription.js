'use strict';

var models = require('./../../../models');
var Subscription = models.Subscription;

var validators = require('./../../../services/validators');
var subscriptionFixture = require('./../../fixtures/subscription');

var assert = require('chai').assert;

describe('SERVICE - VALIDATORS - Subscription', function() {
  var testData;

  beforeEach(function(done) {
    subscriptionFixture.createSubscription().then(function(result) {
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

  describe('#validate', function() {
    describe('happy path', function() {
      it('should succeed on validating all counts', function(done) {
        validators.subscription(testData.account.id, 'session', 1).then(function() {
          return validators.subscription(testData.account.id, 'contactList', 1);
        }).then(function() {
          return validators.subscription(testData.account.id, 'survey', 1);
        }).then(function() {
          done();
        }).catch(function(error) {
          done(error);
        });
      });
    });

    describe('sad path', function() {
      // it('should fail on validating session count', function(done) {
      //   validators.subscription(testData.account.id, 'session', 1).then(function() {
      //     return validators.subscription(testData.account.id, 'contactList', 1);
      //   }).then(function() {
      //     return validators.subscription(testData.account.id, 'survey', 1);
      //   }).then(function() {
      //     done();
      //   }).catch(function(error) {
      //     done(error);
      //   });
      // });
    });
  });
});
