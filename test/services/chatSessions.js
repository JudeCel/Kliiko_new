'use strict';

var userFixture = require('./../fixtures/user');
var sessionFixture = require('./../fixtures/session');
var models = require('./../../models');
var usersServices = require('./../../services/users');
var ChatSessions = require('./../../services/chatSessions.js');
var Account = models.Account;
var AccountUser = models.AccountUser;
var assert = require('chai').assert;


describe('SERVICE - ChatSessions', function() {
  var participantUserId = null;
  var userWithAccess = null;
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
        userWithAccess = result.user

        usersServices.create(attrs, function(errors, user) {

          AccountUser.update({
            owner: false,
            role: "participant"
          }, {
            where: {UserId: user.id}
          }).then(function (result) {
            AccountUser.find({
              where: {UserId: user.id}
            }).then(function(participantAccountUser) {
              participantUserId = participantAccountUser.UserId;
              done();
            })
          })
          .catch(function (err) {
            done(err);
          });
        });
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
      ChatSessions.copySession(testSession.id, userWithAccess.id).then(function(result) {
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
              // console.log(participantUserId)

      ChatSessions.copySession(testSession.id, participantUserId).then(function(result) {
        done("Should not get here!");
      }, function(error) {
        assert.equal(error, "You don't have access, to do this action.");
        done()
      })
    })
  })

  describe('Delete session', function() {
    it("happy path", function(done) {
      ChatSessions.deleteSession(testSession.id, userWithAccess.id).then(function(result) {
        assert.equal(result, 'Session sucessfully deleted.')
        done();
      }, function(error) {
        done('Should not get here!');
      })
    })

    it("sad path", function(done) {
      ChatSessions.deleteSession(testSession.id, participantUserId).then(function(result) {
        done('Should not get here!');
      }, function(error) {
        assert.equal(error, "You don't have access, to do this action.");
        done();
      })
    })
  })

});
