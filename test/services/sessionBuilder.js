'use strict';

var assert = require('chai').assert;
var userFixture = require('./../fixtures/user');
var models = require('./../../models');
var sessionBuilderServices = require('./../../services/sessionBuilder');

describe('SERVICE - SessionBuilder', function() {
  var testUser, testAccount;

  beforeEach(function(done) {
    userFixture.createUserAndOwnerAccount().then(function(result) {
      testUser = result.user;
      testAccount = result.account;
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
          assert.equal(result.sessionBuilder.steps.step2.topics, null);
          assert.equal(result.sessionBuilder.steps.step3.stepName, 'manageSessionEmails');
          assert.equal(result.sessionBuilder.steps.step3.incentive_details, null);
          assert.equal(result.sessionBuilder.steps.step3.emailTemplates, null);
          assert.equal(result.sessionBuilder.steps.step4.stepName, 'manageSessionParticipants');
          assert.equal(result.sessionBuilder.steps.step4.participants, null);
          assert.equal(result.sessionBuilder.steps.step5.stepName, 'inviteSessionObservers');
          assert.equal(result.sessionBuilder.steps.step5.observers, null);
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
            sessionBuilderServices.nextStep(params.id, params.id, params).then(function(result) {
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
            sessionBuilderServices.nextStep(params.id, params.id, params).then(function(result) {
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

  });

  describe("Step two", function(done) {

  });

});
