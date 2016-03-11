'use strict';

var models = require('./../../../models');
var Subscription = models.Subscription;

var subscriptionValidators = require('./../../../services/validators/subscription');
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
        subscriptionValidators.validate(testData.account.id, 'session', 1).then(function() {
          return subscriptionValidators.validate(testData.account.id, 'contactList', 1);
        }).then(function() {
          return subscriptionValidators.validate(testData.account.id, 'survey', 1);
        }).then(function() {
          done();
        }).catch(function(error) {
          done(error);
        });
      });
    });

    describe('sad path', function() {
      it('should fail because no subscription', function(done) {
        subscriptionValidators.validate(testData.account.id + 100, 'session', 1).then(function() {
          done('Should not get here!');
        }).catch(function(error) {
          assert.equal(error, subscriptionValidators.messages.notFound);
          done();
        });
      });

      it('should fail because invalid dependency', function(done) {
        subscriptionValidators.validate(testData.account.id, 'randomString', 1).then(function() {
          done('Should not get here!');
        }).catch(function(error) {
          assert.equal(error, subscriptionValidators.messages.notValidDependency);
          done();
        });
      });

      it('should fail on validating session count', function(done) {
        let params = {
          accountId: testData.account.id,
          name: 'some name',
          start_time: new Date(),
          end_time: new Date()
        };

        models.Session.create(params).then(function() {
          subscriptionValidators.validate(testData.account.id, 'session', 1).then(function() {
            done('Should not get here!');
          }).catch(function(error) {
            assert.equal(error, subscriptionValidators.messages.count('session', 1));
            done();
          });
        }, function(error) {
          done(error)
        });
      });

      it('should fail on validating contactList count', function(done) {
        let params = {
          accountId: testData.account.id,
          name: 'some name'
        };

        models.ContactList.create(params).then(function() {
          subscriptionValidators.validate(testData.account.id, 'contactList', 1).then(function() {
            done('Should not get here!');
          }).catch(function(error) {
            assert.equal(error, subscriptionValidators.messages.count('contactList', 1));
            done();
          });
        }, function(error) {
          done(error)
        });
      });

      it('should fail on validating survey count', function(done) {
        let params = {
          accountId: testData.account.id,
          name: 'some name',
          description: 'some descp',
          thanks: 'some thanks'
        };

        models.Survey.create(params).then(function() {
          subscriptionValidators.validate(testData.account.id, 'survey', 1).then(function() {
            done('Should not get here!');
          }).catch(function(error) {
            assert.equal(error, subscriptionValidators.messages.count('survey', 1));
            done();
          });
        }, function(error) {
          done(error)
        });
      });
    });
  });
});
