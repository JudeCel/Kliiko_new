'use strict';
var {Session, sequelize} = require('../../../models');
var userService = require('../../../services/users');
var backgroundJobsEmailNotifications = require('../../../services/backgroundJobs/emailNotifications');
var assert = require('chai').assert;
var async = require('async');
var messages = require('../../../util/messages');
var sessionMemberService = require('../../../services/sessionMember');
var testDatabase = require("../../database");


describe('Background Jobs - Email Notifications', function() {
  let accountUserId = null;
  let accountId = null;

  let userAttrs = {
    accountName: "Lilo",
    firstName: "Lilu",
    lastName: "Dalas",
    password: "multipassword",
    email: "lilu.tanya@gmail.com",
    gender: "male"
  };

  function sessionMemberParams(sessionId) {
    return {
      sessionId: sessionId,
      username: 'Dude',
      role: 'facilitator',
      accountUserId: accountUserId,
      colour: 'red'
    };
  };

  beforeEach(function(done) {
    testDatabase.prepareDatabaseForTests().then(() => {
      userService.create(userAttrs, (err, user) =>  {
        user.getOwnerAccount().then((accounts) =>  {
          accountUserId = accounts[0].AccountUser.id;
          accountId = accounts[0].dataValues.id;
          done();
        });
      });
    });
  });

  describe("#sendNotification", () => {
    it("succsess", (done) => {
      let sessionParams = {
        name: "Test session",
        step: 'setUp',
        startTime: new Date,
        endTime: new Date,
        accountId: accountId,
        type: "focus",
        timeZone: 'America/Anchorage'
      }
      
      Session.create(sessionParams).then((session) =>  {
        sessionMemberService.createWithTokenAndColour(sessionMemberParams(session.id)).then(function(member) {
          backgroundJobsEmailNotifications.sendNotification(accountUserId, session.id, (error) => {
            if (error) {
              done(error);
            } else {
              done();
            }
          });
        }, (error) => {
          done(error);
        });
      }, (error) => {
        done(error);
      });
    });

    it("failed session not found", (done) => {
      backgroundJobsEmailNotifications.sendNotification(accountUserId, 1000, (error) => {
        try {
          assert.equal(error, messages.sessionMember.notFound);
          done()
        } catch (e) {
          done(e)
        }
      });
    });

  })
});
