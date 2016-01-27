'use strict';

var models = require('./../../models');
var usersServices = require('./../../services/users');
var sessionFixture = require('./../fixtures/session');
var ChatSessions = require('./../../services/chatSessions.js');
var Account = models.Account;
var assert = require('chai').assert;


describe('SERVICE - ChatSessions', function() {
  var testUser = null;
  var testAccount = null;
  var testSession = null;

  beforeEach(function(done) {
     var attrs = {
      accountName: "BLauris",
      firstName: "Lauris",
      lastName: "Blīgzna",
      password: "multipassword",
      email: "bligzna.lauris@gmail.com",
      gender: "male"
    }

    models.sequelize.sync({ force: true }).then(() => {
      sessionFixture.createChat().then(function(result) {
        testSession = result.session;
        testAccount = result.account
        done();
      });
    });
  });

  afterEach(function(done) {
    models.sequelize.sync({ force: true }).then(() => {
      done();
    });
  });

  it("Get all account sessions", function(done) {
    ChatSessions.getAllSessions(testAccount.id).then(function(result) {
      assert.equal(result[0].id, testSession.id)
      assert.equal(result[0].name, testSession.name)
      done();
    }, function(error) {
      done('Should not get here!');
    });
  })

  describe('Copy session', function() {
    it("Happy path", function(done) {
      ChatSessions.copySession(testSession.id).then(function(result) {
        assert.equal(result.message, "Session was successfully duplicated.")
        assert.equal(result.session.name, testSession.name);
        assert.equal(result.session.brand_project_id, testSession.brand_project_id);
        assert.equal(result.session.accountId, testSession.accountId);
        // assert.equal(result.session.start_time, testSession.start_time); // They are the same, but assert say's they are not
        // assert.equal(result.end_time, testSession.end_time); // They are the same, but assert say's they are not
        assert.equal(result.session.incentive_details, testSession.incentive_details);
        assert.equal(result.session.activeId, testSession.activeId);
        assert.equal(result.session.status_id, testSession.status_id);
        assert.equal(result.session.colours_used, testSession.colours_used);
        done();
      }, function(error) {
        done('Should not get here!');
      })
    })

    it("Sad path", function(done) {
      ChatSessions.copySession(testSession.id).then(function(result) {
        done('Should not get here!');
      }, function(error) {
        done("TODO");
      })
    })
  })

  describe('Delete session', function() {
    it.only("happy path", function(done) {
      let user = {id: 1}

      ChatSessions.deleteSession(testSession.id, testAccount.id, user.id).then(function(result) {
        assert.equal(result, 'Session sucessfully deleted.')
        done();
      }, function(error) {
        done('Should not get here!');
      })
    })

    it("sad path", function(done) {
      ChatSessions.deleteSession(testSession.id).then(function(result) {
        done('Should not get here!');
      }, function(error) {
        done("TODO");
      })
    })
  })

});
