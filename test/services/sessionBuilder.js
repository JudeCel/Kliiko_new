"use strict";
var assert = require('chai').assert;
var usersServices = require('./../../services/users');
var models  = require('./../../models');
var sessionBuilder  = require('./../../services/sessionBuilder');

describe("Session Builder", function() {
  let testUser = null;
  let testAccount = null;

  beforeEach(function(done) {
    let attrs = {
      accountName: "BLauris",
      firstName: "Lauris",
      lastName: "Blīgzna",
      password: "multipassword",
      email: "lauris@gmail.com",
      gender: "male"
    };

    models.sequelize.sync({ force: true }).then(() => {
      usersServices.create(attrs, function(errors, user) {
        testUser = user;
        user.getOwnerAccount().then(function(accounts) {
          user.getAccountUsers().then(function(results) {
            testAccount = accounts[0];
            done();
          })
        });
      });
    });
  });

  afterEach(function(done) {
    models.sequelize.sync({ force: true }).then(() => {
      done();
    });
  });

  describe("First step", function(done) {
    let object = null;
    let name = null
    let start_time = null;
    let end_time = null;

    beforeEach(function(done) {
      let params =  {
        accountId: testAccount.id
      }

      sessionBuilder.initializeBuilder(params).then(function(result) {
        object = result;
        done();
      }, function(error) {
        done(error);
      })
    })

    it("initializes new session", function(done) {
      assert.equal(object.sessionBuilder.currentStep, 'setUp')
      assert.equal(object.sessionBuilder.steps.step1.stepName, 'setUp')
      assert.equal(object.sessionBuilder.steps.step1.name, 'untitled')
      assert.equal(object.sessionBuilder.steps.step2.stepName, 'facilitatiorAndTopics')
      assert.equal(object.sessionBuilder.steps.step2.facilitator, null)
      assert.equal(object.sessionBuilder.steps.step2.topics, null)
      assert.equal(object.sessionBuilder.steps.step3.stepName, 'manageSessionEmails')
      assert.equal(object.sessionBuilder.steps.step3.incentive_details, null)
      assert.equal(object.sessionBuilder.steps.step3.emailTemplates, null)
      assert.equal(object.sessionBuilder.steps.step4.stepName, 'manageSessionParticipants')
      assert.equal(object.sessionBuilder.steps.step4.participants, null)
      assert.equal(object.sessionBuilder.steps.step5.stepName, 'inviteSessionObservers')
      assert.equal(object.sessionBuilder.steps.step5.observers, null)
      done();
    })

    it("happy path", function() {
      let start_time = new Date();
      let end_time = new Date();
      let name = "My first cool session"
      end_time.setDate(end_time.getDate() + 10);

      let params = {
        id: object.sessionBuilder.id,
        accountId: testAccount.id,
        name: name,
        start_time: start_time,
        end_time: end_time
      }

      sessionBuilder.update(params).then(function(result) {
        assert.equal(result.sessionBuilder.steps.step1.name, name)
        assert.equal(result.sessionBuilder.steps.step1.start_time, start_time)
        assert.equal(result.sessionBuilder.steps.step1.end_time, end_time)
        done();
      }, function(errors) {
        done(errors);
      })
    })

    it("sad path", function(done) {
      let start_time = new Date();
      let end_time = new Date();
      start_time.setDate(start_time.getDate() + 10);

      let params = {
        id: object.sessionBuilder.id,
        accountId: testAccount.id,
        start_time: start_time,
        end_time: end_time
      }

      sessionBuilder.update(params).then(function(result) {
        done("should not get here");
      }, function(errors) {
        assert.equal(errors.invalidDateRange, "Start date can't be higher then end date.")
        done();
      })
    })
  })

  describe("Step two", function(done) {

  })

})
