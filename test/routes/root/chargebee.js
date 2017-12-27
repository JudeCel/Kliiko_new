'use strict';

var models = require('./../../../models');
var Subscription = models.Subscription;

var chargebeeRoutes = require('./../../../routes/root/chargebee.js');
var userFixture = require('./../../fixtures/user');
var subscriptionPlansFixture = require('./../../fixtures/subscriptionPlans');
var subscriptionServices = require('./../../../services/subscription');
var testDatabase = require("../../database");

var _ = require('lodash');
var assert = require('chai').assert;

describe('ROUTE - Chargebee Webhooks', function() {
  var testData, testSubscription;

  beforeEach(function(done) {
    testDatabase.prepareDatabaseForTests().then(function() {
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

  });

  function successProvider(params) {
    return function() {
      return {
        request: function(callback) {
          callback(null, {
            subscription: { id: params.id, plan_id: 'free_trial_AUD', current_term_end: new Date() },
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
          try {
            assert.equal(expectedStatus, status);
            done();
          } catch (e) {
            done(e)
          }
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
              plan_id: params.plan_id,
              current_term_end: new Date()
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

        subscriptionServices.updateSubscription({accountId: testSubscription.accountId, newPlanId: 'essentials_monthly_aud', skipCardCheck: true}, providers).then(function() {
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
