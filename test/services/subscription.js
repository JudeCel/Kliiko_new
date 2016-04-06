'use strict';

var models = require('./../../models');
var Subscription = models.Subscription;

var subscriptionServices = require('./../../services/subscription');
var userFixture = require('./../fixtures/user');
var subscriptionFixture = require('./../fixtures/subscriptionPlans');
var surveyFixture = require('./../fixtures/survey');

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
      testData.lowerPlan = _.find(results, ['priority', testData.subscriptionPlan.priority - 1]);
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
        currentSubPlanId = subscription.planId;
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
              id: params.id,
              plan_id: params.plan_id
            });
          }
        }
      }
    }

    function viaCheckoutProvider(params) {
      return function() {
        return {
          request: function(callback) {
            callback(null, {
              hosted_page: {
                id: params.id,
                type: "checkout_existing",
                url: "https://yourapp.chargebee.com/pages/v2/EmKrsbXtONZfPVXmoSHLVpfBJYlsIIut/checkout",
                state: "created",
                embed: true,
                created_at: 1453977370,
                expires_at: 1453980970,
                object: "hosted_page"
              }
            });
          }
        }
      }
    }

    function invalidCreditCardProvider() {
      return function() {
        return {
          request: function(callback) {
            callback(null, {
              customer: {
                card_status: "no_card"
              }
            });
          }
        }
      }
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

    describe('happy path', function() {
      it('should succeed on updating subscription without valid credit card', function(done) {
        let smsCount = 650; // sms count that is expected when updating from "free" plan to "unlimited" plan!
        let providers = {
          creditCard: invalidCreditCardProvider(),
          viaCheckout: viaCheckoutProvider({ id: 'SomeUniqueID' })
        }
        subscriptionServices.updateSubscription(testData.account.id, testData.subscriptionPlan.chargebeePlanId, providers).then(function(result) {
          assert.equal(result.redirect, true);
          assert.equal(result.hosted_page.object, "hosted_page");
          assert.equal(result.hosted_page.id, "SomeUniqueID");
          assert.equal(result.hosted_page.url, "https://yourapp.chargebee.com/pages/v2/EmKrsbXtONZfPVXmoSHLVpfBJYlsIIut/checkout");
          done();
        }, function(error) {
          done(error);
        });
      });

      it('should succeed on updating subscription with valid credit card', function(done) {
        let smsCount = 650; // sms count that is expected when updating from "free" plan to "unlimited" plan!
        let providers = {
          creditCard: validCreditCardProvider(),
          updateProvider: updateProvider({ id: 'SomeUniqueID', plan_id: testData.subscriptionPlan.chargebeePlanId })
        }
        subscriptionServices.updateSubscription(testData.account.id, testData.subscriptionPlan.chargebeePlanId, providers).then(function(result) {
          assert.isNotNull(result.subscription);
          assert.isNotNull(result.subscription.SubscriptionPreference);
          assert.equal(result.subscription.accountId, testData.account.id);
          assert.equal(result.subscription.planId, testData.subscriptionPlan.chargebeePlanId);
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
        let invalidPlanId = "this_will_not_work";
        let providers = {
          updateProvider: errorProvider('some error'),
          creditCard: validCreditCardProvider()
        }

        subscriptionServices.updateSubscription(testData.account.id, invalidPlanId, providers).then(function() {
          done('Should not get here!');
        }, function(error) {
          assert.deepEqual(error, 'No plan found');
          done();
        });
      });

      it('No subscription found', function(done) {
        let invalidAccountId = testData.account.id + 100;
        let providers = {
          updateProvider: updateProvider({ id: 'SomeUniqueID', plan_id: testData.subscriptionPlan.chargebeePlanId }),
          creditCard: validCreditCardProvider()
        }

        subscriptionServices.updateSubscription(invalidAccountId, testData.subscriptionPlan.id, providers).then(function(subscription) {
          done('Should not get here!');
        }, function(error) {
          assert.equal(error, "No subscription found");
          done();
        });
      });

      it('cant switch on the same plan as user has already', function(done) {
        let invalidAccountId = testData.account.id + 100;
        let providers = {
          updateProvider: updateProvider({ id: 'SomeUniqueID', plan_id: currentSubPlanId }),
          creditCard: validCreditCardProvider()
        }

        Subscription.find({
          where: {
            accountId: testData.account.id
          },
          include: [models.SubscriptionPlan]
        }).then(function(subscription) {
          subscriptionServices.updateSubscription(testData.account.id, subscription.SubscriptionPlan.chargebeePlanId, providers).then(function(subscription) {
            done('Should not get here!');
          }, function(error) {
            assert.equal(error, "Can't switch to current plan");
            done();
          });
        })
      });

      describe("downgrade", function() {
        function getUltimateSub(testData) {
          let providers = {
            creditCard: validCreditCardProvider(),
            updateProvider: updateProvider({ id: 'SomeUniqueID', plan_id: testData.subscriptionPlan.chargebeePlanId })
           }
          return function(cb) {
            subscriptionServices.updateSubscription(testData.account.id, testData.subscriptionPlan.chargebeePlanId, providers).then(function(subscription) {
              cb();
            }, function(error) {
              cb(error);
            });
          }
        }

        describe("happy path", function() {
          it('should successfully downgrade plan', function(done) {
            let functionList = [
              getUltimateSub(testData)
            ]

            async.waterfall(functionList, function (error, result) {
              if( error ){
                done(error);
              } else {
                let providers = {
                  creditCard: validCreditCardProvider(),
                  updateProvider: updateProvider({ id: 'SomeUniqueID', plan_id: testData.subscriptionPlan.chargebeePlanId })
                 }

                subscriptionServices.updateSubscription(testData.account.id, testData.lowerPlan.chargebeePlanId, providers).then(function(result) {
                  assert.equal(result.subscription.planId, testData.lowerPlan.chargebeePlanId);
                  done();
                }, function(error) {
                  done("should not get here");
                });
              }
            });
          });
        });

        describe("sad path", function() {

          function createTestSurvey(testData) {
            return function(cb) {
              surveyFixture.createSurvey(testData.account.name).then(function() {
                cb();
              }, function(error) {
                cb(error);
              })
            }
          }

          function createSession(testData) {
            let startTime = new Date();
            let endTime = startTime.setHours(startTime.getHours() + 2000)

            return function(cb) {
              models.Session.create({
                accountId: testData.account.id,
                start_time: startTime,
                end_time: endTime,
                name: "My cool session"
              }).then(function() {
                cb();
              }).catch(function(error) {
                cb(error);
              });
            }
          }

          function createTestContactList(testData) {
            return function(cb) {
              models.ContactList.create({
                accountId: testData.account.id,
                name: "My cool Test contact list"
              }).then(function() {
                cb();
              }).catch(function(error) {
                cb(error);
              });
            }
          }

          it('downgrade not possible due to many surveys, sessions and contact lists for account', function(done) {
            let functionList = [
              getUltimateSub(testData),
              createTestSurvey(testData),
              createTestSurvey(testData),
              createTestSurvey(testData),
              createSession(testData),
              createSession(testData),
              createSession(testData),
              createSession(testData),
              createSession(testData),
              createSession(testData),
              createSession(testData),
              createSession(testData),
              createSession(testData),
              createSession(testData),
              createTestContactList(testData)
            ]

            async.waterfall(functionList, function (error, result) {
              if( error ){
                done(error);
              } else {
                let providers = {
                  creditCard: validCreditCardProvider(),
                  updateProvider: updateProvider({ id: 'SomeUniqueID', plan_id: testData.subscriptionPlan.chargebeePlanId })
                 }

                subscriptionServices.updateSubscription(testData.account.id, testData.lowerPlan.chargebeePlanId, providers).then(function(subscription) {
                  done("should not get here");
                }, function(error) {
                  assert.equal(error.survey, 'You have to many surveys');
                  assert.equal(error.contactList, 'You have to many contact lists');
                  assert.equal(error.session, 'You have to many sessions');
                  done();
                });
              }
            });

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

  describe('#findSubscriptionByChargebeeId', function() {
    var subId = 'SomeUniqueID';

    describe('happy path', function() {
      beforeEach(function(done) {
        subscriptionServices.createSubscription(testData.account.id, testData.user.id, successProvider({ id: subId })).then(function() {
          done();
        }, function(error) {
          done(error);
        });
      });

      it('should succeed on finding subscription', function(done) {
        subscriptionServices.findSubscriptionByChargebeeId(subId).then(function(subscription) {
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
        subscriptionServices.findSubscriptionByChargebeeId('someNonExistingId').then(function(subscription) {
          done('Should not get here!');
        }, function(error) {
          assert.equal(error, subscriptionServices.messages.notFound.subscription);
          done();
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

  describe('#cancelSubscription', function() {
    var subId = 'SomeUniqueID';
    beforeEach(function(done) {
      subscriptionServices.createSubscription(testData.account.id, testData.user.id, successProvider({ id: subId })).then(function() {
        done();
      }, function(error) {
        done(error);
      });
    });

    // Should have contact list promise also
    function surveyPromise() {
      return models.Survey.count({ where: { accountId: testData.account.id, closed: true } });
    }

    function sessionPromise() {
      return models.Session.count({ where: { accountId: testData.account.id, active: false } });
    }

    describe('happy path', function() {
      function surveyHelper() {
        return function(cb) {
          let params = {
            accountId: testData.account.id,
            name: 'some name',
            description: 'some descp',
            thanks: 'some thanks'
          };

          models.Survey.create(params).then(function() {
            cb();
          }, function(error) {
            cb(error);
          });
        }
      }

      function sessionHelper() {
        return function(cb) {
          let params = {
            accountId: testData.account.id,
            name: 'some name',
            start_time: new Date(),
            end_time: new Date()
          };

          models.Session.create(params).then(function() {
            cb();
          }, function(error) {
            cb(error);
          });
        }
      }

      beforeEach(function(done) {
        async.parallel([
          function(cb) {
            let functionArray = [surveyHelper(), surveyHelper()];
            async.waterfall(functionArray, function(error, _result) {
              cb(error);
            });
          },
          function(cb) {
            let functionArray = [sessionHelper(), sessionHelper()];
            async.waterfall(functionArray, function(error, _result) {
              cb(error);
            });
          }
        ], function(error, _result) {
          done(error);
        });
      });

      it('should succeed on closing subscription and dependencies', function(done) {
        surveyPromise().then(function(c) {
          assert.equal(c, 0);
          return sessionPromise();
        }).then(function(c) {
          assert.equal(c, 0);
          return subscriptionServices.cancelSubscription(subId, 'someEventId');
        }).then(function(result) {
          Subscription.find({ where: { subscriptionId: subId } }).then(function(subscription) {
            assert.equal(subscription.active, false);
            return result.promise;
          }).then(function() {
            return surveyPromise();
          }).then(function(c) {
            assert.equal(c, 2);
            return sessionPromise();
          }).then(function(c) {
            assert.equal(c, 2);
            done();
          }).catch(function(error) {
            done(error);
          });
        }, function(error) {
          done(error);
        });
      });
    });

    describe('sad path', function() {
      it('should fail because cannot find subscription', function(done) {
        subscriptionServices.cancelSubscription('someNonExistingId', 'someEventId').then(function() {
          done('Should not get here!');
        }, function(error) {
          assert.deepEqual(error, subscriptionServices.messages.notFound.subscription);
          done();
        });
      });

      it('should fail no dependencies', function(done) {
        subscriptionServices.cancelSubscription(subId, 'someEventId').then(function(result) {
          return result.promise;
        }).then(function() {
          return surveyPromise();
        }).then(function(c) {
          assert.equal(c, 0);
          return sessionPromise();
        }).then(function(c) {
          assert.equal(c, 0);
          done();
        }).catch(function(error) {
          done(error);
        });
      });
    });
  });

  describe('#recurringSubscription', function() {
    var subId = 'SomeUniqueID';
    beforeEach(function(done) {
      subscriptionServices.createSubscription(testData.account.id, testData.user.id, successProvider({ id: subId })).then(function() {
        done();
      }, function(error) {
        done(error);
      });
    });

    describe('happy path', function() {
      it('should succeed on changed subscription preferences', function(done) {
        subscriptionServices.findSubscriptionByChargebeeId(subId).then(function(subscription) {
          // currentSms (50) and planSms (50) should be equal,
          // after recurring preference model value should be currentSms + planSms (100)
          let currentSms = subscription.SubscriptionPreference.data.paidSmsCount;
          let planSms = subscription.SubscriptionPlan.paidSmsCount;
          assert.equal(currentSms, planSms);

          subscriptionServices.recurringSubscription(subId, 'someEventId').then(function(result) {
            assert.equal(result.subscription.lastWebhookId, 'someEventId');
            return result.promise;
          }).then(function(result) {
            assert.equal(result.SubscriptionPreference.data.paidSmsCount, currentSms + planSms);
            done();
          }).catch(function(error) {
            done(error);
          });
        });
      });
    });

    describe('sad path', function() {
      it('should fail because cannot find subscription', function(done) {
        subscriptionServices.recurringSubscription('someNonExistingId', 'someEventId').then(function() {
          done('Should not get here!');
        }, function(error) {
          assert.deepEqual(error, subscriptionServices.messages.notFound.subscription);
          done();
        });
      });
    });
  });

});
