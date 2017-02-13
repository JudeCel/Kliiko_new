"use strict";
var assert = require("chai").assert;
var models  = require('./../../models');
var mailHelper = require('./../../mailers/mailHelper');
var mailFixture = require('./../fixtures/mailTemplates');
var userFixture = require('./../fixtures/user');
var constants = require('../../util/constants');
var mailTemplateService = require('./../../services/mailTemplate');
var momentTimeZone = require('moment-timezone');

let accountId;
let params = {
  role: "accountManager",
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
  orginalStartTime: new Date(),
  orginalEndTime: new Date(),
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
  browserBackground: '#EFEFEF',
  mainBackground: '#FFFFFF',
  mainBorder: '#C3BE2E',
  font: '#58595B',
  headerButton: '#4CBFE9',
  consoleButtonActive: '#4CB649',
  hyperlinks: '#2F9F69',
  acceptButton: '#4CB649',
  notAtAllButton: '#E51D39',
  notThisTimeButton: '#4CBFE9',
  participantFirstName: 'Name',
  participantLastName: 'Last',
  guestFirstName: 'Name',
  guestLastName: 'Last',
  timeZone: momentTimeZone.tz.names()[0]
};

describe('send MailTemplates',  () => {
  before((done) => {
    models.sequelize.sync({force: true}).done((error, result) => {
      userFixture.createUserAndOwnerAccount().then(function(result) {
        accountId = result.account.id;
        params.accountId = result.account.id;
        mailFixture.createMailTemplate().then(function(result) {
          done();
        });
      }, function(error) {
        done(error);
      });
    });
  });

  describe('#Make copies of mail template', function() {
    it('#Create copy of mail template', (done) =>  {
      models.MailTemplate.find({
        include: [{ model: models.MailTemplateBase, attributes: ['id', 'name'], where: {category: "firstInvitation"}}],
        attributes: constants.mailTemplateFields,
        raw: true
      }).then((result) => {
        try {
          mailTemplateService.saveMailTemplate(result, false, accountId, false, (error, saveResult) => {
            assert.isNull(error);
            assert.notEqual(saveResult.id, result.id, 'should not overwrite original mail');
            done();
          });
        } catch (error) {
          done(error);
        }
      }).catch((err) => {
        done(err);
      });
    });
  });

  describe('#Send mail templates', function() {

    it('Send session close mail', (done) =>  {
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

    it('Send observer invitation', (done) =>  {
      mailHelper.sendObserverInvitation(params, function(error){
        assert.isNull(error);
        done();
      });
    });

  });
});
