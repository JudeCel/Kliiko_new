'use strict';

var assert = require('chai').assert;
var userFixture = require('./../fixtures/user');
var models = require('./../../models');

var sessionBuilderServices = require('./../../services/sessionBuilder');
var async = require('async');

describe('SERVICE - SessionBuilder', function() {
  var testUser, testAccount, testAccountUser;

  beforeEach(function(done) {
    userFixture.createUserAndOwnerAccount().then(function(result) {
      testUser = result.user;
      testAccount = result.account;
      testAccountUser = result.accountUser;
      done();
    }, function(error) {
      done(error);
    });
  });

  afterEach(function(done) {
    models.sequelize.sync({ force: true }).then(() => {
      done();
    });
  });

  function accountParams() {
    return { accountId: testAccount.id };
  };

  function sessionParams(data) {
    return {
      id: data.sessionBuilder.id,
      accountId: testAccount.id,
      startTime: new Date(),
      endTime: new Date()
    };
  };

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
          assert.equal(result.sessionBuilder.currentStep, 'setUp');
          assert.equal(result.sessionBuilder.steps.step1.stepName, 'setUp');
          assert.equal(result.sessionBuilder.steps.step1.name, 'untitled');
          assert.equal(result.sessionBuilder.steps.step2.stepName, 'facilitatiorAndTopics');
          assert.equal(result.sessionBuilder.steps.step2.facilitator, null);
          assert.deepEqual(result.sessionBuilder.steps.step2.topics, []);
          assert.equal(result.sessionBuilder.steps.step3.stepName, 'manageSessionEmails');
          assert.equal(result.sessionBuilder.steps.step3.incentive_details, null);
          assert.deepEqual(result.sessionBuilder.steps.step3.emailTemplates, []);
          assert.equal(result.sessionBuilder.steps.step4.stepName, 'manageSessionParticipants');
          assert.deepEqual(result.sessionBuilder.steps.step4.participants, []);
          assert.equal(result.sessionBuilder.steps.step5.stepName, 'inviteSessionObservers');
          assert.deepEqual(result.sessionBuilder.steps.step5.observers, []);
          done();
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
          params.name = 'My first cool session';

          sessionBuilderServices.update(params.id, params.accountId, params).then(function(result) {
            assert.equal(result.sessionBuilder.steps.step1.name, params.name);
            done();
          }, function(error) {
            done(error);
          });
        });
      });
    });

    describe('sad path', function(done) {
      it('should fail on updating session', function(done) {
        sessionBuilderServices.initializeBuilder(accountParams()).then(function(result) {
          let params = sessionParams(result);
          params.name = "";

          sessionBuilderServices.update(params.id, params.accountId, params).then(function(result) {
            done('Should not get here!');
          }, function(error) {
            assert.equal(error.name, "Name can't be empty");
            done();
          });
        });
      });
    });
  });

  describe('#nextStep', function(done) {
    describe('happy path', function(done) {
      it('should go to next step', function(done) {
        sessionBuilderServices.initializeBuilder(accountParams()).then(function(result) {
          let params = sessionParams(result);
          params.name = 'My first cool session';

          models.SessionMember.create(sessionMemberParams(result.sessionBuilder.id)).then(function(member) {
            sessionBuilderServices.update(params.id, params.accountId, params).then(function(result) {
              sessionBuilderServices.nextStep(params.id, params.accountId, params).then(function(result) {
                assert.equal(result.sessionBuilder.steps.step1.name, params.name);
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

    describe('sad path', function(done) {
      it('should fail on moving to next step because last step', function(done) {
        sessionBuilderServices.initializeBuilder(accountParams()).then(function(result) {
          let params = sessionParams(result);
          params.step = 'done';

          sessionBuilderServices.update(params.id, params.accountId, params).then(function(result) {
            assert.equal(result.sessionBuilder.currentStep, params.step);

            sessionBuilderServices.nextStep(params.id, params.accountId, params).then(function(result) {
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
          params.step = 'manageSessionEmails';

          sessionBuilderServices.update(params.id, params.accountId, params).then(function(result) {
            assert.equal(result.sessionBuilder.currentStep, params.step);

            sessionBuilderServices.prevStep(params.id, params.accountId).then(function(result) {
              assert.equal(result.sessionBuilder.currentStep, 'facilitatiorAndTopics');
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
          assert.equal(result.sessionBuilder.currentStep, 'setUp');

          sessionBuilderServices.update(params.id, params.accountId, params).then(function(result) {
            assert.equal(result.sessionBuilder.currentStep, 'setUp');

            sessionBuilderServices.prevStep(params.id, params.accountId).then(function(result) {
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
        sessionBuilderServices.initializeBuilder(accountParams()).then(function(result) {
          let params = {
            message: 'random message',
            recievers: [{
              mobile: mobileNumber
            }, {
              mobile: mobileNumber
            }]
          };

          sessionBuilderServices.sendSms(params, provider).then(function(result) {
            assert.equal(result, 'All messages have been sent');
            done();
          }, function(error) {
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

          let errorMessage = "The 'To' number nonNumberMobile is not a valid phone number.";
          let provider = errorProvider(errorMessage);

          sessionBuilderServices.sendSms(params, provider).then(function(result) {
            done('Should not get here!');
          }, function(error) {
            assert.equal(error, errorMessage);
            done();
          });
        });
      });
    });
  });

  describe('#removeSessionMember', function(done) {
    describe('happy path', function(done) {
      it('should remove session member from session', function(done) {
        sessionBuilderServices.initializeBuilder(accountParams()).then(function(result) {
          models.SessionMember.create(sessionMemberParams(result.sessionBuilder.id)).then(function(member) {

            sessionBuilderServices.removeSessionMember({ id: result.sessionBuilder.id, sessionMemberId: member.id }).then(function(result) {
              assert.equal(result, sessionBuilderServices.messages.sessionMemberRemoved);
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
      it('should fail on finding session member to remove', function(done) {
        sessionBuilderServices.initializeBuilder(accountParams()).then(function(result) {
          models.SessionMember.create(sessionMemberParams(result.sessionBuilder.id)).then(function(member) {

            sessionBuilderServices.removeSessionMember({ id: result.sessionBuilder.id + 100, sessionMemberId: member.id }).then(function(result) {
              done('Should not get here!');
            }, function(error) {
              assert.equal(error, sessionBuilderServices.messages.sessionMemberNotFound);
              done();
            });
          }).catch(function(error) {
            done(error);
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
        expireAt: new Date(),
        role: 'facilitator',
        ownerId: sessionId,
        ownerType: 'session',
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

      it('should fail on finding invite because status not pending', function(done) {
        sessionBuilderServices.initializeBuilder(accountParams()).then(function(result) {
          let params = inviteParams(result.sessionBuilder.id);
          params.status = 'confirmed';

          models.Invite.create(params).then(function(invite) {

            sessionBuilderServices.removeInvite({ id: result.sessionBuilder.id, inviteId: invite.id }).then(function(result) {
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
          params.name = 'My first cool session';

          models.SessionMember.create(sessionMemberParams(result.sessionBuilder.id)).then(function(member) {
            sessionBuilderServices.update(params.id, params.accountId, params).then(function(result) {
              sessionBuilderServices.nextStep(params.id, params.accountId, params).then(function(result) {
                sessionBuilderServices.findSession(params.id, params.accountId).then(function(session) {
                  assert.equal(session.step, 'facilitatiorAndTopics');
                  done();
                }, function(error) {
                  done(error);
                });
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
      it('should fail on #update', function(done) {
        sessionBuilderServices.initializeBuilder(accountParams()).then(function(result) {
          let params = sessionParams(result);

          sessionBuilderServices.update(params.id, params.accountId, { end_time: null }).then(function(result) {
            done('Should not get here!');
          }, function(error) {
            assert.equal(error.end_time, "End Time can't be empty");
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
        name: 'Krucs!'
      }
    }

    function createDependencies(params, skip, callback) {
      async.parallel([
        function(cb) {
          if(skip.facilitator) {
            cb();
          }
          else {
            models.SessionMember.create(sessionMemberParams(params.id)).then(function(member) {
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
                  models.SessionTopics.findAll().then(function(result) {
                    cb();
                  })
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
          params.step = 'facilitatiorAndTopics';

          sessionBuilderServices.update(params.id, params.accountId, params).then(function(result) {
            createDependencies(params, {}, function(error) {
              if(error) {
                done(error);
              }
              else {
                sessionBuilderServices.nextStep(params.id, params.accountId, params).then(function(result) {
                  sessionBuilderServices.findSession(params.id, params.accountId).then(function(session) {
                    assert.equal(session.step, 'manageSessionEmails');
                    done();
                  }, function(error) {
                    done(error);
                  });
                }, function(error) {
                  done(error);
                });
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
          let params = sessionParams(result);
          params.step = 'facilitatiorAndTopics';

          sessionBuilderServices.update(params.id, params.accountId, params).then(function(result) {
            sessionBuilderServices.nextStep(params.id, params.accountId, params).then(function(result) {
              done('Should not get here!');
            }, function(error) {
              assert.equal(error.topics, 'No topics selected');
              done();
            });
          }, function(error) {
            done(error);
          });
        });
      });

      it('should fail because no topics', function(done) {
        sessionBuilderServices.initializeBuilder(accountParams()).then(function(result) {
          let params = sessionParams(result);
          params.step = 'facilitatiorAndTopics';

          sessionBuilderServices.update(params.id, params.accountId, params).then(function(result) {
            createDependencies(params, { topics: true }, function(error) {
              if(error) {
                done(error);
              }
              else {
                sessionBuilderServices.nextStep(params.id, params.accountId, params).then(function(result) {
                  done('Should not get here!');
                }, function(error) {
                  assert.equal(error.topics, sessionBuilderServices.messages.errors.secondStep.topics);
                  done();
                });
              }
            });
          }, function(error) {
            done(error);
          });
        });
      });
    });
  });

  describe('#thirdStep', function(done) {
    function mailTemplateParams(sessionId) {
      return {
        name: "Test Name",
        subject: "Test Subject",
        content: "<p>Test Content</p>",
        systemMessage: true,
        sessionId: sessionId,
        isCopy: true,
        required: true
      }
    }

    function multipleTemplates(count, sessionId) {
      let array = new Array(count);
      array.fill(
        function(cb) {
          models.MailTemplate.create(mailTemplateParams(sessionId)).then(function(result) {
            cb();
          }).catch(function(error) {
            cb(error);
          });
        }
      );
      return array;
    };

    describe('happy path', function(done) {
      it('should succeed on moving to next step', function(done) {
        sessionBuilderServices.initializeBuilder(accountParams()).then(function(result) {
          let params = sessionParams(result);
          params.step = 'manageSessionEmails';

          sessionBuilderServices.update(params.id, params.accountId, params).then(function(result) {
            async.parallel(multipleTemplates(5, params.id), function(error, _result) {
              if(error){
                done(error);
              }
              sessionBuilderServices.nextStep(params.id, params.accountId, params).then(function(result) {
                sessionBuilderServices.findSession(params.id, params.accountId).then(function(session) {
                  assert.equal(session.step, 'manageSessionParticipants');
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
      it('should fail because mail templates less then 5', function(done) {
        sessionBuilderServices.initializeBuilder(accountParams()).then(function(result) {
          let params = sessionParams(result);
          params.step = 'manageSessionEmails';

          sessionBuilderServices.update(params.id, params.accountId, params).then(function(result) {
            sessionBuilderServices.nextStep(params.id, params.accountId, params).then(function(result) {
              done('Should not get here!');
            }, function(error) {
              assert.equal(error.emailTemplates, sessionBuilderServices.messages.errors.thirdStep.emailTemplates + 5);
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
    describe('happy path', function(done) {
      it('should succeed on moving to next step', function(done) {
        sessionBuilderServices.initializeBuilder(accountParams()).then(function(result) {
          let params = sessionParams(result);
          params.step = 'manageSessionParticipants';

          sessionBuilderServices.update(params.id, params.accountId, params).then(function(result) {
            models.SessionMember.create(sessionMemberParams(params.id)).then(function(member) {
              sessionBuilderServices.nextStep(params.id, params.accountId, params).then(function(result) {
                sessionBuilderServices.findSession(params.id, params.accountId).then(function(session) {
                  assert.equal(session.step, 'inviteSessionObservers');
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
          params.step = 'manageSessionParticipants';

          sessionBuilderServices.update(params.id, params.accountId, params).then(function(result) {
            sessionBuilderServices.nextStep(params.id, params.accountId, params).then(function(result) {
              done('Should not get here!');
            }, function(error) {
              assert.equal(error.participants, sessionBuilderServices.messages.errors.fourthStep.participants);
              done();
            });
          }, function(error) {
            done(error);
          });
        });
      });
    });
  });

  describe('#fifthStep', function(done) {
    describe('happy path', function(done) {
      it('should succeed on moving to next step', function(done) {
        sessionBuilderServices.initializeBuilder(accountParams()).then(function(result) {
          let params = sessionParams(result);
          params.step = 'inviteSessionObservers';

          sessionBuilderServices.update(params.id, params.accountId, params).then(function(result) {
            models.SessionMember.create(sessionMemberParams(params.id)).then(function(member) {
              sessionBuilderServices.nextStep(params.id, params.accountId, params).then(function(result) {
                sessionBuilderServices.findSession(params.id, params.accountId).then(function(session) {
                  assert.equal(session.step, 'done');
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
      it('should fail because no observers', function(done) {
        sessionBuilderServices.initializeBuilder(accountParams()).then(function(result) {
          let params = sessionParams(result);
          params.step = 'manageSessionParticipants';

          sessionBuilderServices.update(params.id, params.accountId, params).then(function(result) {
            sessionBuilderServices.nextStep(params.id, params.accountId, params).then(function(result) {
              done('Should not get here!');
            }, function(error) {
              assert.equal(error.observers, sessionBuilderServices.messages.errors.fourthStep.observers);
              done();
            });
          }, function(error) {
            done(error);
          });
        });
      });
    });
  });

});
