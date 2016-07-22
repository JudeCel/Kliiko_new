'use strict';

var models = require('./../../../models');
var Subscription = models.Subscription;

var chargebeeRoutes = require('./../../../routes/root/chargebee.js');
var userFixture = require('./../../fixtures/user');
var subscriptionPlansFixture = require('./../../fixtures/subscriptionPlans');
var subscriptionServices = require('./../../../services/subscription');

var _ = require('lodash');
var assert = require('chai').assert;

describe('ROUTE - Chargebee Webhooks', function() {
  var testData, testSubscription;

  beforeEach(function(done) {
    userFixture.createUserAndOwnerAccount().then(function(result) {
      testData = result;
      return subscriptionPlansFixture.createPlans();
    }).then(function(results) {
      subscriptionServices.createSubscription(testData.account.id, testData.user.id, successProvider({ id: 'SomeUniqueID' })).then(function(subscription) {
        testSubscription = subscription;
        done();
      }, function(error) {
        done(error);
      });
    }).catch(function(error) {
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
          callback(null, {
            subscription: { id: params.id, plan_id: 'free_trial' },
            customer: { id: params.id }
          });
        }
      }
    }
  }

  function subParams() {
    return {
      accountId: testData.account.id,
      subscriptionPlanId: testSubscription.subscriptionPlanId,
      planId: 'somePlanId',
      customerId: 'someCusId',
      subscriptionId: testSubscription.id
    };
  }

  describe('#endPoint', function() {
    function reqObject(subId, eventType) {
      return {
        body: {
          id: 'someEventId',
          event_type: eventType || 'subscription_cancelled',
          content: {
            subscription: {
              id: subId
            }
          },
          provider: {
            creditCard: validCreditCardProvider(),
            updateProvider: updateProvider({ id: subId, plan_id: testSubscription.planId })
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

    function validCreditCardProvider() {
      return function() {
        return {
          request: function(callback) {
            callback(null, {
              customer: {
                card_status: "valid"
              }
            });
          }
        }
      }
    }

    function updateProvider(params) {
      return function() {
        return {
          request: function(callback) {
            callback(null, {
              id: "",
              plan_id: params.plan_id
            });
          }
        }
      }
    }

    describe('happy path', function() {
      it('should return 200', function(done) {
        let providers = {
          creditCard: validCreditCardProvider(),
          updateProvider: updateProvider({ id: testSubscription.subscriptionId, plan_id: testSubscription.planId })
        }

        subscriptionServices.updateSubscription({accountId: testSubscription.accountId, newPlanId: 'core_monthly', skipCardCheck: true}, providers).then(function() {
          chargebeeRoutes.endPoint(reqObject(testSubscription.subscriptionId), resObject(200, done));
        });
      });

      it('should work if random hook comes in', function(done) {
        chargebeeRoutes.endPoint(reqObject('someSubId', 'randomEventType'), resObject(200, done));
      });
    });

    describe('sad path', function() {
      it('should return 500', function(done) {
        chargebeeRoutes.endPoint(reqObject('someOtherSubId'), resObject(500, done));
      });
    });
  });
});
