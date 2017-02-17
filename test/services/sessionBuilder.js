'use strict';

var assert = require('chai').assert;
var userFixture = require('./../fixtures/user');
var subscriptionFixture = require('./../fixtures/subscription');
var mailFixture = require('./../fixtures/mailTemplates');
var constants = require('../../util/constants');
var models = require('./../../models');
var testDatabase = require("../database");
var sessionBuilderServices = require('./../../services/sessionBuilder');
var sessionMemberService = require('./../../services/sessionMember');
var inviteService = require('./../../services/invite');
var async = require('async');
var _ = require('lodash');

describe('SERVICE - SessionBuilder', function() {
  var testUser, testAccount, testAccountUser, subscriptionId;
  beforeEach(function(done) {
    testDatabase.prepareDatabaseForTests().then(() => {
      userFixture.createUserAndOwnerAccount().then(function(result) {
        testUser = result.user;
        testAccount = result.account;
        testAccountUser = result.accountUser;
        subscriptionFixture.createSubscription(testAccount.id, testUser.id).then(function(subscription) {
          subscriptionId = subscription.id;
          models.SubscriptionPreference.update({'data.sessionCount': 2}, { where: { subscriptionId: subscription.id } }).then(function(result) {
            done();
          }, function(error) {
            done(error);
          })
        }, function(error) {
          done(error);
        })
      }, function(error) {
        done(error);
      });
    });
  });

  function accountParams() {
    return {
      accountId: testAccount.id,
      userId: testUser.id,
      timeZone: 'Europe/Riga',
      type: 'focus',
    };
  };

  function sessionParams(data) {
    return {
      id: data.sessionBuilder.id,
      accountId: testAccount.id,
      name: 'untitled',
      startTime: (new Date()).toISOString(),
      endTime: getNextDate().toISOString(),
      timeZone: 'Europe/Riga',
      snapshot: data.sessionBuilder.snapshot,
      isVisited: {    
        setUp: false, 
        facilitatiorAndTopics: false, 
        manageSessionEmails: false,
        manageSessionParticipants: false,
        inviteSessionObservers: false
      }
    };
  };

  function getNextDate() {
    let res = new Date();
    res.setDate(res.getDate() + 1);
    return res;
  }

  function sessionMemberParams(sessionId) {
    return {
      sessionId: sessionId,
      username: 'Dude',
      role: 'facilitator',
      accountUserId: testAccountUser.id,
      colour: 'red'
    };
  };

  describe('#initializeBuilder', function(done) {
    describe('happy path', function(done) {
      it('should initialize builder', function(done) {
        sessionBuilderServices.initializeBuilder(accountParams()).then(function(result) {
          try {
            assert.equal(result.sessionBuilder.currentStep, 'setUp');
            assert.equal(result.sessionBuilder.steps.step1.stepName, 'setUp');
            assert.equal(result.sessionBuilder.steps.step1.name, '');
            assert.equal(result.sessionBuilder.steps.step1.facilitator, null);
            assert.equal(result.sessionBuilder.steps.step2.stepName, 'facilitatiorAndTopics');
            assert.deepEqual(result.sessionBuilder.steps.step2.topics, []);
            assert.equal(result.sessionBuilder.steps.step3.stepName, 'manageSessionEmails');
            assert.equal(result.sessionBuilder.steps.step3.incentive_details, null);
            assert.deepEqual(result.sessionBuilder.steps.step3.emailTemplates, []);
            assert.equal(result.sessionBuilder.steps.step4.stepName, 'manageSessionParticipants');
            assert.deepEqual(result.sessionBuilder.steps.step4.participants, []);
            assert.equal(result.sessionBuilder.steps.step5.stepName, 'inviteSessionObservers');
            assert.deepEqual(result.sessionBuilder.steps.step5.observers, []);
            assert.isObject(result.sessionBuilder.snapshot);

            for (var i = 1; i <= 5; i++) {
              assert.equal(result.sessionBuilder.steps['step' + i].isVisited, false);
            }
            done();
          } catch (e) {
            done(e);
          }
        }, function(error) {
          done(error);
        });
      });

      it('should create default topic', function(done) {
        sessionBuilderServices.initializeBuilder(accountParams()).then(function(result) {
          models.SessionTopics.find({where: {sessionId: result.sessionBuilder.id}}).then(function(result) {
            try {
              assert.isTrue(result != null);
              done();
            } catch (e) {
              done(e);
            }
          }, function(error) {
            done(error);
          });
        });
      });

      it('should create new session when expired session exists', function(done) {
        sessionBuilderServices.initializeBuilder(accountParams()).then(function(result) {
          sessionBuilderServices.initializeBuilder(accountParams()).then(function(result) {
            done();
          }, function(error) {
            done(error);
          });
        }, function(error) {
          done(error);
        });
      });

      it('should new expired session when other open session exists', function(done) {
        models.SubscriptionPreference.update({'data.sessionCount': 1}, { where: { subscriptionId: subscriptionId } }).then(function(result) {
          sessionBuilderServices.initializeBuilder(accountParams()).then(function(result) {
            let params = sessionParams(result);
            sessionBuilderServices.update(params.id, params.accountId, params).then(function(result) {
              sessionBuilderServices.initializeBuilder(accountParams()).then(function(result) {
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
        }, function(error) {
          done(error);
        });
      });
    });

    describe('sad path', function(done) {
      it('should fail update without valid snapshot', function(done) {
        models.SubscriptionPreference.update({'data.sessionCount': 1}, { where: { subscriptionId: subscriptionId } }).then(function(result) {
          sessionBuilderServices.initializeBuilder(accountParams()).then(function(result) {
            let params = sessionParams(result);
            params.snapshot = { test: true }
            sessionBuilderServices.update(params.id, params.accountId, params).then(function(result) {
              assert.isObject(result.validation);
              assert.equal(result.validation.isValid, false);
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

      it('should fail opening new session when other open session exists', function(done) {
        models.SubscriptionPreference.update({'data.sessionCount': 1}, { where: { subscriptionId: subscriptionId } }).then(function(result) {
          sessionBuilderServices.initializeBuilder(accountParams()).then(function(result) {
            let params = sessionParams(result);
            sessionBuilderServices.update(params.id, params.accountId, params).then(function(result) {
              sessionBuilderServices.initializeBuilder(accountParams()).then(function(result) {
                let params2 = sessionParams(result);
                sessionBuilderServices.update(params2.id, params2.accountId, params2).then(function(result) {
                  done('Should not open second session!');
                }, function(error) {
                  done();
                });
              }, function(error) {
                done(error);
              });
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
    });
  });

  describe('#findSession', function(done) {
    describe('happy path', function(done) {
      it('should find session', function(done) {
        sessionBuilderServices.initializeBuilder(accountParams()).then(function(result) {
          sessionBuilderServices.findSession(result.sessionBuilder.id, testAccount.id).then(function(session) {
            assert.equal(session.id, result.sessionBuilder.id);
            assert.equal(session.accountId, testAccount.id);
            done();
          }, function(error) {
            done(error);
          });
        }, function(error) {
          done(error);
        });
      });
    });

    describe('sad path', function(done) {
      it('should fail on finding session', function(done) {
        sessionBuilderServices.initializeBuilder(accountParams()).then(function(result) {
          sessionBuilderServices.findSession(result.sessionBuilder.id + 100, testAccount.id).then(function(session) {
            done('Should not get here!');
          }, function(error) {
            assert.equal(error, sessionBuilderServices.messages.notFound);
            done();
          });
        }, function(error) {
          done(error);
        });
      });
    });
  });

  describe('#update', function(done) {
    describe('happy path', function(done) {
      it('should update session', function(done) {
        sessionBuilderServices.initializeBuilder(accountParams()).then(function(result) {

          let params = sessionParams(result);
          params.name = 'My first session';

          sessionBuilderServices.update(params.id, params.accountId, params).then(function(result) {
            assert.equal(result.sessionBuilder.steps.step1.name, params.name);
            done();
          }, function(error) {
            done(error);
          });
        });
      });
    });
  });

  describe('#nextStep', function(done) {
    describe('happy path', function(done) {
      it('should go to next step', function(done) {
        mailFixture.createMailTemplate().then(function() {
          sessionBuilderServices.initializeBuilder(accountParams()).then(function(result) {
            let params = sessionParams(result);
            let nextStepIndex = 2;
            params.name = 'My first session';
            sessionMemberService.createWithTokenAndColour(sessionMemberParams(result.sessionBuilder.id)).then(function(member) {
              sessionBuilderServices.update(params.id, params.accountId, params).then(function(result) {
                sessionBuilderServices.goToStep(params.id, params.accountId, nextStepIndex).then(function(result) {
                  assert.equal(result.sessionBuilder.steps.step1.name, params.name);
                  assert.equal(result.sessionBuilder.steps.step1.isVisited, true);
                  done();
                }, function(error) {
                  done(error);
                });
              }, (error) => {
                done(error)
              });
            }, (error) => {
              done(error);
            });
          }, function(error) {
            done(error);
          });
        })
      });
    });

    describe('sad path', function(done) {
      it('should fail on moving to next step because last step', function(done) {
        sessionBuilderServices.initializeBuilder(accountParams()).then(function(result) {
          let params = sessionParams(result);
          params.step = 'inviteSessionObservers';
          let nextStepIndex = 6;

          sessionBuilderServices.update(params.id, params.accountId, params).then(function(result) {
            assert.equal(result.sessionBuilder.currentStep, params.step);

            sessionBuilderServices.goToStep(params.id, params.accountId, nextStepIndex).then(function(result) {
              assert.equal(result.sessionBuilder.currentStep, params.step);
              done();
            }, function(error) {
              done(error);
            });
          });
        });
      });
    });
  });

  describe('#prevStep', function(done) {
    describe('happy path', function(done) {
      it('should go to previous step', function(done) {
        sessionBuilderServices.initializeBuilder(accountParams()).then(function(result) {
          let params = sessionParams(result);
          let nextStepIndex = 2;
          params.step = 'manageSessionEmails';

          sessionBuilderServices.update(params.id, params.accountId, params).then(function(result) {
            assert.equal(result.sessionBuilder.currentStep, params.step);

            sessionBuilderServices.goToStep(params.id, params.accountId, nextStepIndex).then(function(result) {
              assert.equal(result.sessionBuilder.currentStep, 'facilitatiorAndTopics');
              assert.equal(result.sessionBuilder.steps.step2.isVisited, true);
              done();
            }, function(error) {
              done(error);
            });
          });
        });
      });
    });

    describe('sad path', function(done) {
      it('should fail on moving to previous step because first step', function(done) {
        sessionBuilderServices.initializeBuilder(accountParams()).then(function(result) {
          let params = sessionParams(result);
          let nextStepIndex = 0;
          assert.equal(result.sessionBuilder.currentStep, 'setUp');

          sessionBuilderServices.update(params.id, params.accountId, params).then(function(result) {
            assert.equal(result.sessionBuilder.currentStep, 'setUp');

            sessionBuilderServices.goToStep(params.id, params.accountId, nextStepIndex).then(function(result) {
              assert.equal(result.sessionBuilder.currentStep, 'setUp');
              done();
            }, function(error) {
              done(error);
            });
          });
        });
      });
    });
  });

  describe('#openBuild', function(done) {
    describe('happy path', function(done) {
      it('should return existing session builder object', function(done) {
        sessionBuilderServices.initializeBuilder(accountParams()).then(function(result1) {
          sessionBuilderServices.openBuild(result1.sessionBuilder.id, testAccount.id).then(function(result2) {
            assert.equal(result1.sessionBuilder.id, result2.sessionBuilder.id);
            done();
          }, function(error) {
            done(error);
          });
        });
      });
    });

    describe('sad path', function(done) {
      it('should fail on finding session', function(done) {
        sessionBuilderServices.initializeBuilder(accountParams()).then(function(result1) {
          sessionBuilderServices.openBuild(result1.sessionBuilder.id + 100, testAccount.id).then(function(result2) {
            done('Should not get here');
          }, function(error) {
            assert.equal(error, sessionBuilderServices.messages.notFound);
            done();
          });
        });
      });
    });
  });

  describe('#sendSms', function(done) {
    var mobileNumber = process.env.TWILIO_SENDER_NUMBER

    describe('happy path', function(done) {
      function provider(params, callback) {
        callback();
      };

      it('should send sms to numbers', function(done) {
        const smsParams = {
          message: 'random message',
          recievers: [{
            mobile: mobileNumber
          }, {
            mobile: mobileNumber
          }]
        };

        const subscriptionPreferenceParams = {
          'data.sessionCount': 10,
          'data.planSmsCount': 1,
          'data.paidSmsCount': 1

        }
        models.SubscriptionPreference.update(subscriptionPreferenceParams, { where: { subscriptionId: subscriptionId } }).then(() => {
          sessionBuilderServices.initializeBuilder(accountParams()).then(() => {
            sessionBuilderServices.sendSms(testAccount.id, smsParams, provider).then((result) => {
              models.SubscriptionPreference.find({ where: { subscriptionId: subscriptionId } }).then((sp) => {
                try {
                  assert.equal(result, 'All sms have been sent');
                  assert.equal(sp.data.planSmsCount, 0);
                  assert.equal(sp.data.paidSmsCount, 0);
                  done();
                } catch (e) {
                  done(e);
                }
              });
            }, function(error) {
              done(error);
            });
          }, (error) => {
            done(error);
          });
        });
      });
    });

    describe('sad path', function(done) {
      function errorProvider(error) {
        return function(params, callback) {
          callback({ message: error });
        };
      }

      it('should on sending sms because invalid number', function(done) {
        sessionBuilderServices.initializeBuilder(accountParams()).then(function(result) {
          let params = {
            message: 'random message',
            recievers: [{
              mobile: 'nonNumberMobile'
            }]
          };
          const subscriptionPreferenceParams = {
            'data.sessionCount': 1,
            'data.planSmsCount': 10,
            'data.paidSmsCount': 10

          }

          let errorMessage = "The 'To' number nonNumberMobile is not a valid phone number.";
          let provider = errorProvider(errorMessage);
          models.SubscriptionPreference.update(subscriptionPreferenceParams, { where: { subscriptionId: subscriptionId } }).then(() => {
            sessionBuilderServices.sendSms(testAccount.id, params, provider).then(function(result) {
              done('Should not get here!');
            }, function(error) {
              try {
                assert.equal(error, errorMessage);
                done();
              } catch (e) {
                done(e);
              }
            });
          });
        });
      });
    });
  });

  describe('#removeInvite', function(done) {
    function inviteParams(sessionId) {
      return {
        token: 'randomtoken',
        sentAt: new Date(),
        role: 'facilitator',
        sessionId: sessionId,
        accountUserId: testAccountUser.id
      }
    }

    describe('happy path', function(done) {
      it('should remove session invite', function(done) {
        sessionBuilderServices.initializeBuilder(accountParams()).then(function(result) {
          models.Invite.create(inviteParams(result.sessionBuilder.id)).then(function(invite) {

            sessionBuilderServices.removeInvite({ id: result.sessionBuilder.id, inviteId: invite.id }).then(function(result) {
              assert.equal(result, sessionBuilderServices.messages.inviteRemoved);
              done();
            }, function(error) {
              done(error);
            });
          }).catch(function(error) {
            done(error);
          });
        });
      });
    });

    describe('sad path', function(done) {
      it('should fail on finding invite because wrong id', function(done) {
        sessionBuilderServices.initializeBuilder(accountParams()).then(function(result) {
          models.Invite.create(inviteParams(result.sessionBuilder.id)).then(function(invite) {

            sessionBuilderServices.removeInvite({ id: result.sessionBuilder.id + 100, inviteId: invite.id }).then(function(result) {
              done('Should not get here!');
            }, function(error) {
              assert.equal(error, sessionBuilderServices.messages.inviteNotFound);
              done();
            });
          }).catch(function(error) {
            done(error);
          });
        });
      });
    });
  });

  describe('#firstStep', function(done) {
    describe('happy path', function(done) {
      it('should succeed on moving to next step', function(done) {
        sessionBuilderServices.initializeBuilder(accountParams()).then(function(result) {
          let params = sessionParams(result);
          let nextStepIndex = 2;
          params.name = 'My first session';
          sessionBuilderServices.update(params.id, params.accountId, params).then(function(result) {
           sessionMemberService.createWithTokenAndColour(sessionMemberParams(result.sessionBuilder.id)).then(function(member) {
              inviteService.createFacilitatorInvite({sessionId: member.sessionId, accountUserId: member.accountUserId}).then(function() {
                sessionBuilderServices.goToStep(params.id, params.accountId, nextStepIndex).then(function(result) {
                  sessionBuilderServices.findSession(params.id, params.accountId).then(function(session) {
                    assert.equal(session.step, 'facilitatiorAndTopics');
                    assert.equal(result.sessionBuilder.steps.step2.isVisited, true);
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
    });

    describe('sad path', function(done) {
      it('should fail on #update', function(done) {
        sessionBuilderServices.initializeBuilder(accountParams()).then(function(result) {
          let params = sessionParams(result);

          sessionBuilderServices.update(params.id, params.accountId, { endTime: null }).then(function(result) {
            done('Should not get here!');
          }, function(error) {
            assert.equal(error.endTime, "End Time can't be empty");
            done();
          });
        });
      });
    });
  });

  describe('#secondStep', function(done) {
    function topicParams(accountId) {
      return {
        accountId: accountId,
        name: 'Krucs!',
        boardMessage: 'Hello'
      }
    }

    function createDependencies(params, skip, callback) {
      async.parallel([
        function(cb) {
          if(skip.facilitator) {
            cb();
          }
          else {
           sessionMemberService.createWithTokenAndColour(sessionMemberParams(params.id)).then(function(member) {
              cb();
            }, function(error) {
              cb(error);
            });
          }
        },
        function(cb) {
          if(skip.topics) {
            cb();
          }
          else {
            models.Topic.create(topicParams(params.accountId)).then(function(topic) {
              sessionBuilderServices.findSession(params.id, params.accountId).then(function(session) {
                session.addTopics([topic]).then(function() {
                  cb();
                }, function(error) {
                  cb(error);
                });
              });
            }, function(error) {
              cb(error);
            });
          }
        },
      ], function(error, _result) {
        callback(error);
      });
    }

    describe('happy path', function(done) {
      it('should succeed on moving to next step', function(done) {
        sessionBuilderServices.initializeBuilder(accountParams()).then(function(result) {
          let params = sessionParams(result);
          let nextStepIndex = 3;
          params.step = 'facilitatiorAndTopics';

          sessionBuilderServices.update(params.id, params.accountId, params).then(function(result) {
            createDependencies(params, {}, function(error) {
              if(error) {
                done(error);
              }
              else {
                mailFixture.createMailTemplate().then(function() {
                  sessionBuilderServices.goToStep(params.id, params.accountId, nextStepIndex).then(function(result) {
                    sessionBuilderServices.findSession(params.id, params.accountId).then(function(session) {
                      assert.equal(session.step, 'manageSessionEmails');
                      assert.equal(result.sessionBuilder.steps.step3.isVisited, true);
                      done();
                    }, function(error) {
                      done(error);
                    });
                  }, function(error) {
                    done(error);
                  });
                })
              }
            });
          }, function(error) {
            done(error);
          });
        });
      });
    });

    describe('sad path', function(done) {
      it('should fail because no topics', function(done) {
        sessionBuilderServices.initializeBuilder(accountParams()).then(function(result) {
          //remove default topic from DB
          models.SessionTopics.destroy({where: {sessionId: result.sessionBuilder.id}}).then(() => {
            let params = sessionParams(result);
            let nextStepIndex = 3;
            params.step = 'facilitatiorAndTopics';
            sessionBuilderServices.update(params.id, params.accountId, params).then(function(result) {
              sessionBuilderServices.goToStep(params.id, params.accountId, nextStepIndex).then(function(result) {
                try {
                  assert.equal(result.sessionBuilder.steps.step2.error.topics, 'No topics selected');
                  assert.equal(result.sessionBuilder.steps.step3.isVisited, false);
                  done();
                } catch (error) {
                  done(error);
                }
              });
            }, function(error) {
              done(error);
            });
          }, (error) => {
            console.log(error);
            done(error);
          });
        });
      });
    });

  });

  describe('#thirdStep', function(done) {
    describe('happy path', function(done) {
      it('should succeed on moving to next step', function(done) {
        sessionBuilderServices.initializeBuilder(accountParams()).then(function(result) {
          let params = sessionParams(result);
          let nextStepIndex = 4;
          params.step = 'manageSessionEmails';

          sessionBuilderServices.update(params.id, params.accountId, params).then(function(result) {
            mailFixture.createMailTemplate().then(function() {
              models.MailTemplate.findAll({
                include: [{
                  model: models.MailTemplateBase,
                  where: { category: { $in: constants.sessionBuilderEmails } }
                }]
              }).then(function(result) {
                let ids = _.map(result, 'id');

                models.MailTemplate.update({ sessionId: params.id, isCopy: true }, { where: { MailTemplateBaseId: { $in: ids } } }).then(function() {
                  sessionBuilderServices.goToStep(params.id, params.accountId, nextStepIndex).then(function(result) {
                    sessionBuilderServices.findSession(params.id, params.accountId).then(function(session) {
                      assert.equal(session.step, 'manageSessionParticipants');
                      assert.equal(result.sessionBuilder.steps.step4.isVisited, true);
                      done();
                    }, function(error) {
                      done(error);
                    });
                  }, function(error) {
                    done(error);
                  });
                })
              }, function(error) {
                done(error);
              });
            });
          }, function(error) {
            done(error);
          });
        });
      });
    });

    describe('sad path', function(done) {
      it('should fail because mail templates less then 4', function(done) {
        sessionBuilderServices.initializeBuilder(accountParams()).then(function(result) {
          let params = sessionParams(result);
          let nextStepIndex = 4;
          params.step = 'manageSessionEmails';

          sessionBuilderServices.update(params.id, params.accountId, params).then(function(result) {
            sessionBuilderServices.goToStep(params.id, params.accountId, nextStepIndex).then(function(result) {
              let error = result.sessionBuilder.steps.step3.error.emailTemplates;
              assert.equal(error, sessionBuilderServices.messages.errors.thirdStep.emailTemplates);
              assert.equal(result.sessionBuilder.steps.step4.isVisited, false);
              done();
            });
          }, function(error) {
            done(error);
          });
        });
      });
    });
  });

  describe('#fourthStep', function(done) {
    function inviteParams(sessionId) {
      return {
        token: 'randomtoken',
        sentAt: new Date(),
        role: 'participant',
        sessionId: sessionId,
        accountUserId: testAccountUser.id
      }
    }

    describe('happy path', function(done) {
      it('should succeed on moving to next step', function(done) {
        sessionBuilderServices.initializeBuilder(accountParams()).then(function(result) {
          let params = sessionParams(result);
          let nextStepIndex = 5;
          params.step = 'manageSessionParticipants';

          sessionBuilderServices.update(params.id, params.accountId, params).then(function(result) {
            models.Invite.create(inviteParams(params.id)).then(function() {
              sessionBuilderServices.goToStep(params.id, params.accountId, nextStepIndex).then(function(result) {
                sessionBuilderServices.findSession(params.id, params.accountId).then(function(session) {
                  assert.equal(session.step, 'inviteSessionObservers');
                  assert.equal(result.sessionBuilder.steps.step5.isVisited, true);
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
          }, function(error) {
            done(error);
          });
        });
      });
    });

    describe('sad path', function(done) {
      it('should fail because no participants', function(done) {
        sessionBuilderServices.initializeBuilder(accountParams()).then(function(result) {
          let params = sessionParams(result);
          let nextStepIndex = 5;
          params.step = 'manageSessionParticipants';

          sessionBuilderServices.update(params.id, params.accountId, params).then(function(result) {
            sessionBuilderServices.goToStep(params.id, params.accountId, nextStepIndex).then(function(result) {
              let error = result.sessionBuilder.steps.step4.error.participants;
              assert.equal(error, sessionBuilderServices.messages.errors.fourthStep.participants);
              assert.equal(result.sessionBuilder.steps.step5.isVisited, false);
              done();
            });
          }, function(error) {
            done(error);
          });
        });
      });
    });
  });

  describe('#closeSession', function(done) {
    describe('happy path', function(done) {
      it('should go to fourth step', function(done) {
          sessionBuilderServices.initializeBuilder(accountParams()).then(function(result) {
           sessionMemberService.createWithTokenAndColour(sessionMemberParams(result.sessionBuilder.id)).then(function(member) {
              mailFixture.createMailTemplate().then(function() {
                let params = sessionParams(result);
                params.status = "closed";
                sessionBuilderServices.update(params.id, params.accountId, params).then(function(closeResult) {
                  assert.equal(closeResult.sessionBuilder.currentStep, "manageSessionParticipants");
                  done();
                }, function(error) {
                  done(error);
                });
              });
            });
          }, function(error) {
            done(error);
          });
      });
    });
  });

  describe('#reopenSession', function(done) {
    describe('happy path', function(done) {
      it('should go to fourth step', function(done) {
          sessionBuilderServices.initializeBuilder(accountParams()).then(function(result) {
           sessionMemberService.createWithTokenAndColour(sessionMemberParams(result.sessionBuilder.id)).then(function(member) {
              mailFixture.createMailTemplate().then(function() {
                let closeParams = sessionParams(result);
                closeParams.status = "closed";
                sessionBuilderServices.update(closeParams.id, closeParams.accountId, closeParams).then(function(closeResult) {
                  sessionBuilderServices.goToStep(closeParams.id, closeParams.accountId, 1).then(function(nextStepResult) {
                    let openParams = sessionParams(nextStepResult);
                    openParams.status = "open";
                    sessionBuilderServices.update(closeParams.id, openParams.accountId, openParams).then(function(openResult) {
                      assert.equal(openResult.sessionBuilder.currentStep, "manageSessionParticipants");
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
            });
          }, function(error) {
            done(error);
          });
      });
    });
  });

});
