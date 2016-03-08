'use strict';

var models = require('./../../models');
var Subscription = models.Subscription;

var subscriptionServices = require('./../../services/subscription');
var userFixture = require('./../fixtures/user');
var subscriptionFixture = require('./../fixtures/subscriptionPlans');
var sessionFixture = require('./../fixtures/session');

var async = require('async');
var assert = require('chai').assert;
var _ = require('lodash');

describe('SERVICE - Subscription', function() {
  var testData;
  var currentSubPlanId;

  beforeEach(function(done) {
    userFixture.createUserAndOwnerAccount().then(function(result) {
      testData = result;
      return subscriptionFixture.createPlans();
    }).then(function(results) {
      testData.subscriptionPlan = _.find(results, ['priority', 4]);
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

  function successProvider(params) {
    return function() {
      return {
        request: function(callback) {
          callback(null, {
            subscription: { id: params.id, plan_id: 'free' },
            customer: { id: params.id }
          });
        }
      }
    }
  }

  describe('#createSubscription', function() {
    describe('happy path', function() {
      it('should succeed on creating subscription', function(done) {
        subscriptionServices.createSubscription(testData.account.id, testData.user.id, successProvider({ id: 'SomeUniqueID' })).then(function(subscription) {
          assert.isNotNull(subscription);
          assert.isNotNull(subscription.SubscriptionPreference);
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
          let returningErrors = {
            customerId: "Customer Id can't be empty",
            subscriptionId: "Subscription Id can't be empty"
          };

          assert.deepEqual(error, returningErrors);
          done();
        });
      });
    });
  });

  describe('#updateSubscription', function() {
    beforeEach(function(done) {
      subscriptionServices.createSubscription(testData.account.id, testData.user.id, successProvider({ id: 'SomeUniqueID' })).then(function(subscription) {
        currentSubPlanId = subscription.subscriptionPlanId;
        done();
      }, function(error) {
        done(error);
      });
    });

    function updateProvider(params) {
      return function() {
        return {
          request: function(callback) {
            callback(null, {
              subscription: { id: params.id, plan_id: params.plan_id }
            });
          }
        }
      }
    }

    describe('happy path', function() {
      it('should succeed on updating subscription', function(done) {
        let smsCount = 650; // sms count that is expected when updating from "free" plan to "unlimited" plan!

        subscriptionServices.updateSubscription(testData.account.id, testData.subscriptionPlan.id, updateProvider({ id: 'SomeUniqueID', plan_id: testData.subscriptionPlan.chargebeePlanId })).then(function(subscription) {
          assert.isNotNull(subscription);
          assert.isNotNull(subscription.SubscriptionPreference);
          assert.equal(subscription.accountId, testData.account.id);
          assert.equal(subscription.planId, testData.subscriptionPlan.chargebeePlanId);
          assert.equal(subscription.SubscriptionPreference.data.priority, subscription.SubscriptionPlan.priority);
          assert.equal(subscription.SubscriptionPreference.data.paidSmsCount, smsCount);
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

      it('plan not found', function(done) {
        let invalidPlanId = testData.subscriptionPlan.id + 100;

        subscriptionServices.updateSubscription(testData.account.id, invalidPlanId, errorProvider('some error')).then(function() {
          done('Should not get here!');
        }, function(error) {
          assert.deepEqual(error, 'No plan found');
          done();
        });
      });

      it('No subscription found', function(done) {
        let invalidAccountId = testData.account.id + 100;

        subscriptionServices.updateSubscription(invalidAccountId, testData.subscriptionPlan.id, updateProvider({ id: 'SomeUniqueID', plan_id: testData.subscriptionPlan.chargebeePlanId })).then(function(subscription) {
          done('Should not get here!');
        }, function(error) {
          assert.equal(error, "No subscription found");
          done();
        });
      });

      it('cant switch on the same plan as user has already', function(done) {
        let invalidAccountId = testData.account.id + 100;

        subscriptionServices.updateSubscription(testData.account.id, currentSubPlanId, updateProvider({ id: 'SomeUniqueID', plan_id: testData.subscriptionPlan.chargebeePlanId })).then(function(subscription) {
          done('Should not get here!');
        }, function(error) {
          assert.equal(error, "Can't switch to current plan");
          done();
        });
      });



      describe("downgrade", function() {
        describe("happy path", function() {
          it('should successfully downgrade plan', function(done) {
            done();
          });
        });

        describe("sad path", function() {

          beforeEach(function(done) {
            // async.times(10, function(n, next){
              sessionFixture.createChat().then(function(result) {
                done();
              }, function(error) {
                done(error);
              });
            // }, function(err, sessions) {
            //   done();
            // });
          });

          it.only('downgrade not possible due to many sessions for account', function(done) {
            done();
          });

          it('downgrade not possible due to many surveys for account', function(done) {
            done();

          });

          it('downgrade not possible due to many contact lists for account', function(done) {
            done();

          });
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

  describe('#createPortalSession', function() {
    describe('happy path', function() {
      function portalProvider() {
        return function() {
          return {
            request: function(callback) {
              callback(null, { portal_session: { access_url: 'someOtherUrl' } });
            }
          }
        }
      }

      it('should succeed on creating portal session', function(done) {
        subscriptionServices.createSubscription(testData.account.id, testData.user.id, successProvider({ id: 'SomeUniqueID' })).then(function(subscription) {
          subscriptionServices.createPortalSession(testData.account.id, 'callbackUrl', portalProvider()).then(function(redirectUrl) {
            assert.equal(redirectUrl, 'someOtherUrl');
            done();
          }, function(error) {
            done(error);
          });
        });
      });
    });

    describe('sad path', function() {
      beforeEach(function(done) {
        subscriptionServices.createSubscription(testData.account.id, testData.user.id, successProvider({ id: 'SomeUniqueID' })).then(function() {
          done();
        }, function(error) {
          done(error);
        });
      });

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
        subscriptionServices.createPortalSession(testData.account.id, 'callbackUrl', errorProvider('some error')).then(function(redirectUrl) {
          done('Should not get here!');
        }, function(error) {
          assert.deepEqual(error, { error: 'some error' });
          done();
        });
      });

      it('should fail because subscription not found', function(done) {
        subscriptionServices.createPortalSession(testData.account.id + 100, 'callbackUrl', successProvider({ id: 'SomeUniqueID' })).then(function(redirectUrl) {
          done('Should not get here!');
        }, function(error) {
          assert.equal(error, subscriptionServices.messages.notFound.subscription);
          done();
        });
      });
    });
  });
});
