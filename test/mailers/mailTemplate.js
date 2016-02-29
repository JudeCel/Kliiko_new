"use strict";
var assert = require("chai").assert;
var models  = require('./../../models');
var mailHelper = require('./../../mailers/mailHelper');
var mailFixture = require('./../fixtures/mailTemplates');
var userFixture = require('./../fixtures/user');

let accountId;
let params = {
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
  sessionName: "testSession",
  startTime: "startTime",
  endTime: "endTime",
  startDate: "startDate",
  endDate: "endDate",
  incentive: "testIncentive",
  acceptInvitationUrl: "acceptInvitationUrl",
  invitationNotThisTimeUrl: "invitationNotThisTimeUrl",
  invitationNotAtAllUrl: "invitationNotAtAllUrl",
  confirmationCheckInUrl: "confirmationCheckInUrl",
  participantMail: "testParticipant@gmail.com",
};

describe('send MailTemplates',  () => {
  before((done) => {
    models.sequelize.sync({force: true}).done((error, result) => {
      userFixture.createUserAndOwnerAccount().then(function(result) {
        params.accountId = result.account.id;
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
      mailHelper.sendSessionClose(params, function(error){
        assert.isNull(error);
        done();
      });
    });

    //provide senders accountId in params, this will take latest template version for this account
    it('Send first invitation mail', (done) =>  {
      mailHelper.sendFirstInvitation(params, function(error) {
        assert.isNull(error);
        done();
      });
    });

    //provide senders accountId in params, this will take latest template version for this account
    it('Send invite confirmation mail', (done) =>  {
      mailHelper.sendInviteConfirmation(params, function(error){
        assert.isNull(error);
        done();
      });
    });

    //provide senders accountId in params, this will take latest template version for this account
    it('Send invitation: not this time mail', (done) =>  {
      mailHelper.sendInvitationNotThisTime(params, function(error){
        assert.isNull(error);
        done();
      });
    });


    //provide senders accountId in params, this will take latest template version for this account
    it('Send invitation: not at all mail', (done) =>  {
      mailHelper.sendInvitationNotAtAll(params, function(error){
        assert.isNull(error);
        done();
      });
    });


    //provide senders accountId in params, this will take latest template version for this account
    it('Send generic', (done) =>  {
      mailHelper.sendGeneric(params, function(error){
        assert.isNull(error);
        done();
      });
    });

    //provide senders accountId in params, this will take latest template version for this account
    it('Send facilitator email confirmation', (done) =>  {
      mailHelper.sendFacilitatorEmailConfirmation(params, function(error){
        assert.isNull(error);
        done();
      });
    });



    //provide senders accountId in params, this will take latest template version for this account
    it('Send participant overquota', (done) =>  {
      mailHelper.sendParticipantOverquota(params, function(error){
        assert.isNull(error);
        done();
      });
    });

  });
});
