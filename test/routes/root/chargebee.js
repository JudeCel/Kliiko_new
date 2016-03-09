'use strict';

var models = require('./../../../models');
var Subscription = models.Subscription;

var chargebeeRoutes = require('./../../../routes/root/chargebee.js');
var userFixture = require('./../../fixtures/user');
var subscriptionPlansFixture = require('./../../fixtures/subscriptionPlans');

var _ = require('lodash');
var assert = require('chai').assert;

describe('ROUTE - Chargebee Webhooks', function() {
  var testData;

  beforeEach(function(done) {
    userFixture.createUserAndOwnerAccount().then(function(result) {
      testData = result;
      return subscriptionPlansFixture.createPlans();
    }).then(function(results) {
      testData.subscriptionPlan = _.find(results, ['priority', 4]);
      return Subscription.create(subParams());
    }).then(function(subscription) {
      testData.subscription = subscription;
      done();
    }).catch(function(error) {
      done(error);
    });
  });

  afterEach(function(done) {
    models.sequelize.sync({ force: true }).then(function() {
      done();
    });
  });

  function subParams() {
    return {
      accountId: testData.account.id,
      subscriptionPlanId: testData.subscriptionPlan.id,
      planId: 'somePlanId',
      customerId: 'someCusId',
      subscriptionId: 'someSubId'
    };
  }

  describe('#subCancelled', function() {
    function reqObject(subId) {
      return {
        body: {
          id: 'someEventId',
          content: {
            subscription: {
              id: subId
            }
          }
        }
      };
    }

    function resObject(expectedStatus, done) {
      return {
        sendStatus: function(status) {
          assert.equal(expectedStatus, status);
          done();
        }
      };
    }

    describe('happy path', function() {
      it('should return 200', function(done) {
        chargebeeRoutes.subCancelled(reqObject('someSubId'), resObject(200, done));
      });
    });

    describe('sad path', function() {
      it('should return 500', function(done) {
        chargebeeRoutes.subCancelled(reqObject('someOtherSubId'), resObject(500, done));
      });
    });
  });
});
