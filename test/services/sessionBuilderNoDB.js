'use strict';

var assert = require('chai').assert;
var constants = require('../../util/constants');
var sessionBuilderServices = require('./../../services/sessionBuilder');

describe('SERVICE - SessionBuilder', function() {
  describe('#getDestinationStep', function(done) {
    describe('get destination step when no steps have validation errors', function(done) {
      it('should return \"setUp\" step when destination step number is 1 and steps have no validation errors', function(done) {
        assertStepNameWhenNoErros(1, constants.sessionBuilderSteps[0]);
        done();
      });

      it('should return \"facilitatiorAndTopics\" step when destination step number is 2 and steps have no validation errors', function(done) {
        assertStepNameWhenNoErros(2, constants.sessionBuilderSteps[1]);
        done();
      });

      it('should return \"manageSessionEmails\" step when destination step number is 3 and steps have no validation errors', function(done) {
        assertStepNameWhenNoErros(3, constants.sessionBuilderSteps[2]);
        done();
      });

      it('should return \"manageSessionParticipants\" step when destination step number is 4 and steps have no validation errors', function(done) {
        assertStepNameWhenNoErros(4, constants.sessionBuilderSteps[3]);
        done();
      });

      it('should return \"inviteSessionObservers\" step when destination step number is 5 and steps have no validation errors', function(done) {
        assertStepNameWhenNoErros(5, constants.sessionBuilderSteps[4]);
        done();
      });
    });

    describe('current step is \"manageSessionEmails\" and we are trying to switch to step number 6', function(done) {
        it('should return step we are at (\"manageSessionEmails\")', function(done) {
          let manageSessionEmailsStep = constants.sessionBuilderSteps[2];
          let session = getSession();
          session.currentStep = manageSessionEmailsStep;
          assertStepName(session, 6, manageSessionEmailsStep);
          done();
        });
    });

    describe('current step is \"facilitatiorAndTopics\" and we are trying to switch to step number -3', function(done) {
        it('should return step we are at (\"facilitatiorAndTopics\")', function(done) {
          let facilitatiorAndTopicsStep = constants.sessionBuilderSteps[1];
          let session = getSession();
          session.currentStep = facilitatiorAndTopicsStep;
          assertStepName(session, -3, facilitatiorAndTopicsStep);
          done();
        });
    });

    describe('get step name when step in the middle has validation error', function(done) {
        it('should return step we are at (\"setUp\")', function(done) {
          const errorStep = "step1";
          const expectedStep = constants.sessionBuilderSteps[0];
          for (let i = 0; i < constants.sessionBuilderSteps.length; i++) {
            assertStepNameWhenErrors(i + 1, errorStep, expectedStep);
          }
          done();
        });
    });

    describe('get step name when step after destination has validation error', function(done) {
        it('should return step \"manageSessionEmails\"', function(done) {
          const errorStep = "step4";
          const destinationStepNumber = 3;
          const expectedStep = constants.sessionBuilderSteps[2];
          assertStepNameWhenErrors(destinationStepNumber, errorStep, expectedStep);
          done();
        });
    });

    describe('get step name when destination step has validation error', function(done) {
        it('should return step \"manageSessionParticipants\"', function(done) {
          const errorStep = "step4";
          const destinationStepNumber = 4;
          const expectedStep = constants.sessionBuilderSteps[3];
          assertStepNameWhenErrors(destinationStepNumber, errorStep, expectedStep);
          done();
        });
    });

    describe('get step name when destination step is same step we are at', function(done) {
        it('should return step \"inviteSessionObservers\"', function(done) {
          let session = getSession();
          const inviteSessionObserversStep = constants.sessionBuilderSteps[4];
          const destinationStepNumber = 5;
          session.currentStep = inviteSessionObserversStep;
          assertStepName(session, destinationStepNumber, inviteSessionObserversStep);
          done();
        });
    });

    describe('get step name when destination step number is less than 1', function(done) {
        it('should return step \"setUp\"', function(done) {
          let session = getSession();
          const setUpStep = constants.sessionBuilderSteps[0];
          const destinationStepNumber = -1;
          assertStepNameWhenNoErros(destinationStepNumber, setUpStep);
          done();
        });
    });

    describe('get step name when destination step number is bigger than 5', function(done) {
        it('should return step \"inviteSessionObservers\"', function(done) {
          const inviteSessionObserversStep = constants.sessionBuilderSteps[4];
          const destinationStepNumber = 5;
          assertStepNameWhenNoErros(destinationStepNumber, inviteSessionObserversStep);
          done();
        });
    });

    function assertStepNameWhenErrors(stepNumber, errorStep, expectedStepName) {
      let session = getSession();
      session.steps[errorStep].error = { testError: "Error test" };
      assertStepName(session, stepNumber, expectedStepName);
    }

    function assertStepNameWhenNoErros(stepNumber, expectedStepName) {
      assertStepName(getSession(), stepNumber, expectedStepName);
    }

    function assertStepName(session, stepNumber, expectedStepName) {
      let actualStepName = sessionBuilderServices.getDestinationStep(session, stepNumber);
      assert.equal(actualStepName, expectedStepName);
    }
  });

  describe('#isValidatedWithErrors', function(done) {
    const currentStepIndex = 0;
    const destinationStepIndex = 2;

    describe('has validation errors', function(done) {
      it('should return true', function(done) {
        let session = getSession();
        session.steps.step1.error = { testError: "test error" };
        let hasErrors = sessionBuilderServices.isValidatedWithErrors(currentStepIndex, destinationStepIndex, session.steps);
        assert.equal(hasErrors, true);
        done();
      });
    });

    describe('no validation errors', function(done) {
      it('should return false', function(done) {
        let hasErrors = sessionBuilderServices.isValidatedWithErrors(currentStepIndex, destinationStepIndex, getSession().steps);
        assert.equal(hasErrors, false);
        done();
      });
    });

    describe('no validation errors but going to previous step', function(done) {
      it('should return false', function(done) {
        const currentIndex = 3;
        const destinationIndex = 1;
        let session = getSession();
        session.steps.step2.error = { testError: "test error" };
        let hasErrors = sessionBuilderServices.isValidatedWithErrors(currentIndex, destinationIndex, session.steps);
        assert.equal(hasErrors, false);
        done();
      });
    });
  });

  function getSession() {
    return {
      currentStep: "setUp",
      steps: getSteps()
    };
  }

  function getSteps() {
    return {
      step1: {
        stepName: "setUp"
      },
      step2: {
        stepName: "facilitatiorAndTopics"
      },
      step3: {
        stepName: "manageSessionEmails"
      },
      step4: {
        stepName: "manageSessionParticipants"
      },
      step4: {
        stepName: "inviteSessionObservers"
      }
    };
  }
});
