"use strict";
var assert = require("chai").assert;
var models  = require('./../../models');
var UserService  = require('./../../services/users');
var mailHelper = require('./../../mailers/mailHelper');
var mailFixture = require('./../fixtures/mailTemplates');


var validAttrs = {
  accountName: "DainisL",
  firstName: "Dainis",
  lastName: "Lapins",
  password: "cool_password",
  email: "dainis@gmail.com",
  gender: "male"
}

describe('send MailTemplates',  () => {

  beforeEach((done) => {
    models.sequelize.sync({force: true}).done((error, result) => {
      UserService.create(validAttrs, function(errors, result) {
        if (errors) {
          return done(errors);
        }
        result.getOwnerAccount().done(function(results) {
          mailFixture.createMailTemplate().then(function(result) {
            done();
          });
        });
      });
    });
  });

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

});

  //provide senders accountId in params, this will take latest template version for this account
  it('Send session slose mail', (done) =>  {
    var params = {
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
    mailHelper.sendFirstInvitation(params, function(error){
      assert.isNull(error);
      done();
    });
  });
/*
  //provide senders accountId in params, this will take latest template version for this account
  function sendInviteConfirmation(params, callback) {
    mailTemplateService.getActiveMailTemplate("confirmation", params.accountId, function(error, result) {
      if (error) {
        return callback(error);
      }
      var mailContent = mailTemplateService.composeMailFromTemplate(result, {
        firstName: params.firstName, //receiver name
        startTime: params.startTime,
        startDate: params.startDate,
        confirmationCheckInUrl: params.confirmationCheckInUrl,
        participantMail: params.participantMail,
        incentive: params.incentive,
        facilitatorFirstName: params.facilitatorFirstName,
        facilitatorLastName: params.facilitatorLastName,
        facilitatorMail: params.facilitatorMail,
        facilitatorMobileNumber: params.facilitatorMobileNumber,
        unsubscribeMailUrl: params.unsubscribeMailUrl
      });
      if (mailContent.error) {
        return callback(mailContent.error);
      }
      mailTemplate.sendMailWithTemplate(mailContent, params, callback);
    });
  };

  //provide senders accountId in params, this will take latest template version for this account
  function sendInvitationNotThisTime(params, callback) {
    mailTemplateService.getActiveMailTemplate("notThisTime", params.accountId, function(error, result) {
      if (error) {
        return callback(error);
      }
      var mailContent = mailTemplateService.composeMailFromTemplate(result, {
        firstName: params.firstName, //receiver name
        facilitatorFirstName: params.facilitatorFirstName,
        facilitatorLastName: params.facilitatorLastName,
        facilitatorMail: params.facilitatorMail,
        facilitatorMobileNumber: params.facilitatorMobileNumber,
        unsubscribeMailUrl: params.unsubscribeMailUrl
      });
      if (mailContent.error) {
        return callback(mailContent.error);
      }
      mailTemplate.sendMailWithTemplate(mailContent, params, callback);
    });
  };

  //provide senders accountId in params, this will take latest template version for this account
  function sendInvitationNotAtAll(params, callback) {
    mailTemplateService.getActiveMailTemplate("notAtAll", params.accountId, function(error, result) {
      if (error) {
        return callback(error);
      }
      var mailContent = mailTemplateService.composeMailFromTemplate(result, {
        firstName: params.firstName, //receiver name
        facilitatorFirstName: params.facilitatorFirstName,
        facilitatorLastName: params.facilitatorLastName,
        facilitatorMail: params.facilitatorMail,
        facilitatorMobileNumber: params.facilitatorMobileNumber,
        unsubscribeMailUrl: params.unsubscribeMailUrl
      });
      if (mailContent.error) {
        return callback(mailContent.error);
      }
      mailTemplate.sendMailWithTemplate(mailContent, params, callback);
    });
  };

  //provide senders accountId in params, this will take latest template version for this account
  function sendGeneric(params, callback) {
    mailTemplateService.getActiveMailTemplate("generic", params.accountId, function(error, result) {
      if (error) {
        return callback(error);
      }
      var mailContent = mailTemplateService.composeMailFromTemplate(result, {
        firstName: params.firstName, //receiver name
        facilitatorFirstName: params.facilitatorFirstName,
        facilitatorLastName: params.facilitatorLastName,
        facilitatorMail: params.facilitatorMail,
        facilitatorMobileNumber: params.facilitatorMobileNumber,
        unsubscribeMailUrl: params.unsubscribeMailUrl
      });
      if (mailContent.error) {
        return callback(mailContent.error);
      }
      mailTemplate.sendMailWithTemplate(mailContent, params, callback);
    });
  };

  //provide senders accountId in params, this will take latest template version for this account
  function sendFacilitatorEmailConfirmation(params, callback) {
    mailTemplateService.getActiveMailTemplate("facilitatorConfirmation", null, function(error, result) {
      if (error) {
        return callback(error);
      }
      var mailContent = mailTemplateService.composeMailFromTemplate(result, {
        firstName: params.firstName, //receiver name
        lastName: params.lastName,
        accountName: params.accountName,
        sessionName: params.sessionName,
        startTime: params.startTime,
        endTime: params.endTime,
        startDate: params.startDate,
        endDate: params.endDate,
        logInUrl: params.logInUrl
      });
      if (mailContent.error) {
        return callback(mailContent.error);
      }
      mailTemplate.sendMailWithTemplate(mailContent, params, callback);
    });
  };

  //provide senders accountId in params, this will take latest template version for this account
  function sendParticipantOverquota(params, callback) {
    mailTemplateService.getActiveMailTemplate("facilitatorConfirmation", null, function(error, result) {
      if (error) {
        return callback(error);
      }
      var mailContent = mailTemplateService.composeMailFromTemplate(result, {
        firstName: params.firstName, //receiver name
        lastName: params.lastName,
        accountName: params.accountName,
        sessionName: params.sessionName,
        participantFirstName: params.participantFirstName,
        participantLastName: params.participantLastName,
        logInUrl: params.logInUrl
      });
      if (mailContent.error) {
        return callback(mailContent.error);
      }
      mailTemplate.sendMailWithTemplate(mailContent, params, callback);
    });
  };
*/
