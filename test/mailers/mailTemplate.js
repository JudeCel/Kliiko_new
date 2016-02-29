"use strict";
var assert = require("chai").assert;
var models  = require('./../../models');
var mailHelper = require('./../../mailers/mailHelper');
var mailFixture = require('./../fixtures/mailTemplates');
var userFixture = require('./../fixtures/user');

let accountId;

describe('send MailTemplates',  () => {
  before((done) => {
    models.sequelize.sync({force: true}).done((error, result) => {
      userFixture.createUserAndOwnerAccount().then(function(result) {
        accountId = result.account.id;
        mailFixture.createMailTemplate().then(function(result) {
          done();
        });
      }, function(error) {
        done(error);
      });
    });
  });

  describe('#createOrFindAccountManager', function() {

    it('Send session slose mail', (done) =>  {
      var params = {
        email: "testMailTo@gmail.com",
        firstName: "testName", //receiver name
        incentive: "testIncentive",
        facilitatorMobileNumber: "+3711232122",
        facilitatorFirstName: "facilitatorFirstName",
        facilitatorLastName: "facilitatorLastName",
        facilitatorMail: "facilitatorMail@gmail",
        participateInFutureUrl: "participateInFutureUrl",
        dontParticipateInFutureUrl: "dontParticipateInFutureUrl",
        unsubscribeMailUrl: "unsubscribeMailUrl",
        sessionName: "testSession"
      };

      mailHelper.sendSessionClose(params, function(error){
        assert.isNull(error);
        done();
      });
    });

    //provide senders accountId in params, this will take latest template version for this account
    it('Send first invitation mail', (done) =>  {
      var params = {
        accountId: accountId,
        email: "testMailTo@gmail.com",
        firstName: "testName", //receiver name
        sessionName: "testSession",
        startTime: "startTime",
        endTime: "endTime",
        startDate: "startDate",
        endDate: "endDate",
        incentive: "testIncentive",
        acceptInvitationUrl: "acceptInvitationUrl",
        facilitatorFirstName: "facilitatorFirstName",
        facilitatorLastName: "facilitatorLastName",
        facilitatorMail: "facilitatorMail",
        facilitatorMobileNumber: "facilitatorMobileNumber",
        invitationNotThisTimeUrl: "invitationNotThisTimeUrl",
        invitationNotAtAllUrl: "invitationNotAtAllUrl",
        unsubscribeMailUrl: "unsubscribeMailUrl"
      }
      mailHelper.sendFirstInvitation(params, function(error) {
        assert.isNull(error);
        done();
      });
    });

    //provide senders accountId in params, this will take latest template version for this account
    it('Send invite confirmation mail', (done) =>  {
      var params = {
        accountId: accountId,
        email: "testMailTo@gmail.com",
        firstName: "testName", //receiver name
        startTime: "startTime",
        startDate: "startDate",
        confirmationCheckInUrl: "confirmationCheckInUrl",
        participantMail: "testParticipant@gmail.com",
        incentive: "testIncentive",
        facilitatorFirstName: "facilitatorFirstName",
        facilitatorLastName: "facilitatorLastName",
        facilitatorMail: "facilitatorMail",
        facilitatorMobileNumber: "facilitatorMobileNumber",
        unsubscribeMailUrl: "unsubscribeMailUrl"
      }
      mailHelper.sendInviteConfirmation(params, function(error){
        assert.isNull(error);
        done();
      });
    });

    //provide senders accountId in params, this will take latest template version for this account
    it('Send invitation: not this time mail', (done) =>  {
      var params = {
        accountId: accountId,
        email: "testMailTo@gmail.com",
        firstName: "testName", //receiver name
        facilitatorFirstName: "facilitatorFirstName",
        facilitatorLastName: "facilitatorLastName",
        facilitatorMail: "facilitatorMail",
        facilitatorMobileNumber: "facilitatorMobileNumber",
        unsubscribeMailUrl: "unsubscribeMailUrl"
      }
      mailHelper.sendInvitationNotThisTime(params, function(error){
        assert.isNull(error);
        done();
      });
    });


    //provide senders accountId in params, this will take latest template version for this account
    it('Send invitation: not at all mail', (done) =>  {
      var params = {
        accountId: accountId,
        email: "testMailTo@gmail.com",
        firstName: "testName", //receiver name
        facilitatorFirstName: "facilitatorFirstName",
        facilitatorLastName: "facilitatorLastName",
        facilitatorMail: "facilitatorMail",
        facilitatorMobileNumber: "facilitatorMobileNumber",
        unsubscribeMailUrl: "unsubscribeMailUrl"
      }
      mailHelper.sendInvitationNotAtAll(params, function(error){
        assert.isNull(error);
        done();
      });
    });


    //provide senders accountId in params, this will take latest template version for this account
    it('Send generic', (done) =>  {
      var params = {
        accountId: accountId,
        email: "testMailTo@gmail.com",
        firstName: "testName", //receiver name
        facilitatorFirstName: "facilitatorFirstName",
        facilitatorLastName: "facilitatorLastName",
        facilitatorMail: "facilitatorMail",
        facilitatorMobileNumber: "facilitatorMobileNumber",
        unsubscribeMailUrl: "unsubscribeMailUrl"
      }
      mailHelper.sendGeneric(params, function(error){
        assert.isNull(error);
        done();
      });
    });

    //provide senders accountId in params, this will take latest template version for this account
    it('Send facilitator email confirmation', (done) =>  {
      var params = {
        accountId: accountId,
        email: "testMailTo@gmail.com",
        firstName: "testName", //receiver name
        lastName: "testLastName",
        accountName: "accountName",
        sessionName: "testSession",
        startTime: "startTime",
        startDate: "startDate",
        endTime: "endTime",
        endDate: "endDate",
        logInUrl: "logInUrl"
      }
      mailHelper.sendFacilitatorEmailConfirmation(params, function(error){
        assert.isNull(error);
        done();
      });
    });



    //provide senders accountId in params, this will take latest template version for this account
    it('Send participant overquota', (done) =>  {
      var params = {
        accountId: accountId,
        email: "testMailTo@gmail.com",
        firstName: "testName", //receiver name
        lastName: "testLastName",
        accountName: "accountName",
        sessionName: "testSession",
        participantFirstName: "participantFirstName",
        participantLastName: "participantLastName",
        logInUrl: "logInUrl"
      }
      mailHelper.sendParticipantOverquota(params, function(error){
        assert.isNull(error);
        done();
      });
    });

  });
});
