'use strict';

var models = require('./../../../models');
var Subscription = models.Subscription;

var subscriptionValidators = require('./../../../services/validators/subscription');
var subscriptionFixture = require('./../../fixtures/subscription');

var assert = require('chai').assert;

describe('SERVICE - VALIDATORS - Subscription', function() {
  var testData;

  beforeEach(function(done) {
    models.sequelize.sync({ force: true }).then(function() {
      subscriptionFixture.createSubscription().then(function(result) {
        testData = result;
        done();
      }, function(error) {
        done(error);
      });
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
        let startTime = new Date();
        let endTime = new Date().setDate(new Date().getDate() + 1);
        let params = {
          accountId: testData.account.id,
          name: 'some name',
          startTime: startTime,
          endTime: endTime,
          timeZone: 'Europe/Riga'
        };

        models.Session.create(params).then(function() {
          subscriptionValidators.validate(testData.account.id, 'session', 1).then(function() {
            done('Should not get here!');
          }).catch(function(error) {
            assert.equal(error, subscriptionValidators.countMessage('session', 1));
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
            assert.equal(error, subscriptionValidators.countMessage('contactList', 1));
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
            assert.equal(error, subscriptionValidators.countMessage('survey', 1));
            done();
          });
        }, function(error) {
          done(error)
        });
      });
    });
  });
});
