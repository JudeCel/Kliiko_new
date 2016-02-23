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
          assert.equal(result.sessionBuilder.steps.step3.emailTemplates, null);
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

          sessionBuilderServices.update(params).then(function(result) {
            assert.equal(result.sessionBuilder.steps.step1.name, params.name);
            assert.equal(result.sessionBuilder.steps.step1.startTime, params.startTime);
            assert.equal(result.sessionBuilder.steps.step1.endTime, params.endTime);
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
          params.startTime.setDate(params.startTime.getDate() + 10);

          sessionBuilderServices.update(params).then(function(result) {
            done('Should not get here!');
          }, function(error) {
            assert.equal(error.startTime, sessionBuilderServices.messages.errors.firstStep.invalidDateRange);
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

          sessionBuilderServices.update(params).then(function(result) {
            sessionBuilderServices.nextStep(params.id, params.accountId, params).then(function(result) {
              assert.equal(result.sessionBuilder.steps.step1.name, params.name);
              assert.deepEqual(result.sessionBuilder.steps.step1.startTime, params.startTime);
              assert.deepEqual(result.sessionBuilder.steps.step1.endTime, params.endTime);
              done();
            }, function(error) {
              done(error);
            });
          });
        });
      });
    });

    describe('sad path', function(done) {
      it('should fail on moving to next step', function(done) {
        sessionBuilderServices.initializeBuilder(accountParams()).then(function(result) {
          let params = sessionParams(result);

          sessionBuilderServices.update(params).then(function(result) {
            params.startTime.setDate(params.startTime.getDate() + 10);
            sessionBuilderServices.nextStep(params.id, params.accountId, params).then(function(result) {
              done('Should not get here!');
            }, function(error) {
              assert.equal(error.name, sessionBuilderServices.messages.errors.firstStep.nameRequired);
              assert.equal(error.startTime, sessionBuilderServices.messages.errors.firstStep.invalidDateRange);
              done();
            });
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

          sessionBuilderServices.update(params).then(function(result) {
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
        });
      });
    });

    describe('sad path', function(done) {
      it('should fail on #update', function(done) {
        sessionBuilderServices.initializeBuilder(accountParams()).then(function(result) {
          let params = sessionParams(result);
          params.startTime.setDate(params.startTime.getDate() + 10);

          sessionBuilderServices.update(params).then(function(result) {
            done('Should not get here!');
          }, function(error) {
            assert.equal(error.startTime, sessionBuilderServices.messages.errors.firstStep.invalidDateRange);
            done();
          });
        });
      });

      it('should fail on #nextStep', function(done) {
        sessionBuilderServices.initializeBuilder(accountParams()).then(function(result) {
          let params = sessionParams(result);

          sessionBuilderServices.update(params).then(function(result) {
            params.startTime.setDate(params.startTime.getDate() + 10);

            sessionBuilderServices.nextStep(params.id, params.accountId, params).then(function(result) {
              done('Should not get here!');
            }, function(error) {
              assert.equal(error.name, sessionBuilderServices.messages.errors.firstStep.nameRequired);
              assert.equal(error.startTime, sessionBuilderServices.messages.errors.firstStep.invalidDateRange);
              done();
            });
          });
        });
      });
    });
  });

  describe('#secondStep', function(done) {
    function sessionMemberParams(sessionId) {
      return {
        sessionId: sessionId,
        username: 'Es krucs!',
        role: 'facilitator',
        accountUserId: testAccountUser.id
      }
    }
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
          params.step = 'facilitatiorAndTopics';

          sessionBuilderServices.update(params).then(function(result) {
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
      it('should fail because no facilitator', function(done) {
        sessionBuilderServices.initializeBuilder(accountParams()).then(function(result) {
          let params = sessionParams(result);
          params.step = 'facilitatiorAndTopics';

          sessionBuilderServices.update(params).then(function(result) {
            createDependencies(params, { facilitator: true }, function(error) {
              if(error) {
                done(error);
              }
              else {
                sessionBuilderServices.nextStep(params.id, params.accountId, params).then(function(result) {
                  done('Should not get here!');
                }, function(error) {
                  assert.equal(error.facilitator, sessionBuilderServices.messages.errors.secondStep.facilitator);
                  done();
                });
              }
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

          sessionBuilderServices.update(params).then(function(result) {
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

  describe.only('#thirdStep', function(done) {
    function sessionMemberParams(sessionId) {
      return {
        sessionId: sessionId,
        username: 'Es krucs!',
        role: 'participant',
        accountUserId: testAccountUser.id
      }
    }
    
    describe('happy path', function(done) {
      it('should succeed on moving to next step', function(done) {
        sessionBuilderServices.initializeBuilder(accountParams()).then(function(result) {
          let params = sessionParams(result);
          params.step = 'manageSessionEmails';

          sessionBuilderServices.update(params).then(function(result) {
            models.SessionEmailTemplate.create(sessionMemberParams(params.id)).then(function(member) {
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

    // describe('sad path', function(done) {
    //   it('should fail because no email teplates', function(done) {
    //     sessionBuilderServices.initializeBuilder(accountParams()).then(function(result) {
    //       let params = sessionParams(result);
    //       params.step = 'manageSessionParticipants';

    //       sessionBuilderServices.update(params).then(function(result) {
    //         sessionBuilderServices.nextStep(params.id, params.accountId, params).then(function(result) {
    //           done('Should not get here!');
    //         }, function(error) {
    //           assert.equal(error.participants, sessionBuilderServices.messages.errors.fourthStep.participants);
    //           done();
    //         });
    //       }, function(error) {
    //         done(error);
    //       });
    //     });
    //   });
    // });
  });

  describe('#fourthStep', function(done) {
    function sessionMemberParams(sessionId) {
      return {
        sessionId: sessionId,
        username: 'Es krucs!',
        role: 'participant',
        accountUserId: testAccountUser.id
      }
    }

    describe('happy path', function(done) {
      it('should succeed on moving to next step', function(done) {
        sessionBuilderServices.initializeBuilder(accountParams()).then(function(result) {
          let params = sessionParams(result);
          params.step = 'manageSessionParticipants';

          sessionBuilderServices.update(params).then(function(result) {
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

          sessionBuilderServices.update(params).then(function(result) {
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
    function sessionMemberParams(sessionId) {
      return {
        sessionId: sessionId,
        username: 'Es krucs!',
        role: 'observer',
        accountUserId: testAccountUser.id
      }
    }

    describe('happy path', function(done) {
      it('should succeed on moving to next step', function(done) {
        sessionBuilderServices.initializeBuilder(accountParams()).then(function(result) {
          let params = sessionParams(result);
          params.step = 'inviteSessionObservers';

          sessionBuilderServices.update(params).then(function(result) {
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

          sessionBuilderServices.update(params).then(function(result) {
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