'use strict';
var helpers = require('./helpers');
var mailTemplate = require('./mailTemplate');
var mailTemplateService = require('../services/mailTemplate');

//Note. Provide params.email in all methods

//sent on session close, with future interests
function sendSessionClose(params, callback) {
  mailTemplateService.getActiveMailTemplate("closeSession", null, function(error, result) {
    if (error) {
      return callback(error);
    }
    let mailContent = mailTemplateService.composeMailFromTemplate(result, {
      sessionName: params.sessionName,
      termsOfUseUrl: helpers.getUrl('', '/terms_of_use'),
      privacyPolicyUrl: helpers.getUrl('', '/privacy_policy'),
      firstName: params.firstName, //receiver name
      incentive: params.incentive,
      facilitatorMobileNumber: params.facilitatorMobileNumber,
      facilitatorFirstName: params.facilitatorFirstName,
      facilitatorLastName: params.facilitatorLastName,
      facilitatorMail: params.facilitatorMail,
      participateInFutureUrl: params.participateInFutureUrl,
      dontParticipateInFutureUrl: params.dontParticipateInFutureUrl,
      unsubscribeMailUrl: params.unsubscribeMailUrl
    });
    if (mailContent.error) {
      return callback(mailContent.error);
    }

    mailTemplate.sendMailWithTemplate(mailContent, params, callback);
  });
};

//provide senders accountId in params, this will take latest template version for this account
function sendFirstInvitation(params, callback) {
  mailTemplateService.getActiveMailTemplate("firstInvitation", params, function(error, result) {
    if (error) {
      return callback(error);
    }
    let mailContent = mailTemplateService.composeMailFromTemplate(result, {
      firstName: params.firstName, //receiver name
      termsOfUseUrl: helpers.getUrl('', '/terms_of_use'),
      privacyPolicyUrl: helpers.getUrl('', '/privacy_policy'),
      sessionName: params.sessionName,
      startTime: params.startTime,
      endTime: params.endTime,
      startDate: params.startDate,
      endDate: params.endDate,
      incentive: params.incentive,
      acceptInvitationUrl: params.acceptInvitationUrl,
      facilitatorFirstName: params.facilitatorFirstName,
      facilitatorLastName: params.facilitatorLastName,
      facilitatorMail: params.facilitatorMail,
      facilitatorMobileNumber: params.facilitatorMobileNumber,
      invitationNotThisTimeUrl: params.invitationNotThisTimeUrl,
      invitationNotAtAllUrl: params.invitationNotAtAllUrl,
      unsubscribeMailUrl: params.unsubscribeMailUrl
    });
    if (mailContent.error) {
      return callback(mailContent.error);
    }
    mailTemplate.sendMailWithTemplateAndCalendarEvent(mailContent, params, callback);
  });
};

//provide senders accountId in params, this will take latest template version for this account
function sendInviteConfirmation(params, callback) {
  mailTemplateService.getActiveMailTemplate("confirmation", params, function(error, result) {
    if (error) {
      return callback(error);
    }
    let mailContent = mailTemplateService.composeMailFromTemplate(result, {
      firstName: params.firstName, //receiver name
      termsOfUseUrl: helpers.getUrl('', '/terms_of_use'),
      privacyPolicyUrl: helpers.getUrl('', '/privacy_policy'),
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
    mailTemplate.sendMailWithTemplateAndCalendarEvent(mailContent, params, callback);
  });
};

//provide senders accountId in params, this will take latest template version for this account
function sendInvitationNotThisTime(params, callback) {
  mailTemplateService.getActiveMailTemplate("notThisTime", params, function(error, result) {
    if (error) {
      return callback(error);
    }
    let mailContent = mailTemplateService.composeMailFromTemplate(result, {
      firstName: params.firstName, //receiver name
      termsOfUseUrl: helpers.getUrl('', '/terms_of_use'),
      privacyPolicyUrl: helpers.getUrl('', '/privacy_policy'),
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
  mailTemplateService.getActiveMailTemplate("notAtAll", params, function(error, result) {
    if (error) {
      return callback(error);
    }
    let mailContent = mailTemplateService.composeMailFromTemplate(result, {
      firstName: params.firstName, //receiver name
      termsOfUseUrl: helpers.getUrl('', '/terms_of_use'),
      privacyPolicyUrl: helpers.getUrl('', '/privacy_policy'),
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
  mailTemplateService.getActiveMailTemplate("generic", params, function(error, result) {
    if (error) {
      return callback(error);
    }
    let mailContent = mailTemplateService.composeMailFromTemplate(result, {
      firstName: params.firstName, //receiver name
      termsOfUseUrl: helpers.getUrl('', '/terms_of_use'),
      privacyPolicyUrl: helpers.getUrl('', '/privacy_policy'),
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
    let mailContent = mailTemplateService.composeMailFromTemplate(result, {
      firstName: params.firstName, //receiver name
      termsOfUseUrl: helpers.getUrl('', '/terms_of_use'),
      privacyPolicyUrl: helpers.getUrl('', '/privacy_policy'),
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
    mailTemplate.sendMailWithTemplateAndCalendarEvent(mailContent, params, callback);
  });
};

//provide senders accountId in params, this will take latest template version for this account
function sendParticipantOverquota(params, callback) {
  mailTemplateService.getActiveMailTemplate("facilitatorOverQuota", null, function(error, result) {
    if (error) {
      return callback(error);
    }
    let mailContent = mailTemplateService.composeMailFromTemplate(result, {
      firstName: params.firstName, //receiver name
      termsOfUseUrl: helpers.getUrl('', '/terms_of_use'),
      privacyPolicyUrl: helpers.getUrl('', '/privacy_policy'),
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

function sendObserverInvitation(params, callback) {
  mailTemplateService.getActiveMailTemplate("observerInvitation", null, function(error, result) {
    if (error) {
      return callback(error);
    }
    let mailContent = mailTemplateService.composeMailFromTemplate(result, {
      firstName: params.firstName, //receiver name
      termsOfUseUrl: helpers.getUrl('', '/terms_of_use'),
      privacyPolicyUrl: helpers.getUrl('', '/privacy_policy'),
      lastName: params.lastName,
      accountName: params.accountName,//account we invite
      sessionName: params.sessionName,
      facilitatorFirstName: params.facilitatorFirstName,
      facilitatorLastName: params.facilitatorLastName,
      facilitatorMail: params.facilitatorMail,
      facilitatorMobileNumber: params.facilitatorMobileNumber,
      startTime: params.startTime,
      endTime: params.endTime,
      startDate: params.startDate,
      endDate: params.endDate,
      logInUrl: params.logInUrl
    });
    if (mailContent.error) {
      return callback(mailContent.error);
    }
    mailTemplate.sendMailFromTemplateWithCalendarEvent(mailContent, params, callback);
  });
};

module.exports = {
  sendSessionClose: sendSessionClose,
  sendFirstInvitation: sendFirstInvitation,
  sendInviteConfirmation: sendInviteConfirmation,
  sendInvitationNotThisTime: sendInvitationNotThisTime,
  sendInvitationNotAtAll: sendInvitationNotAtAll,
  sendGeneric: sendGeneric,
  sendFacilitatorEmailConfirmation: sendFacilitatorEmailConfirmation,
  sendParticipantOverquota: sendParticipantOverquota,
  sendObserverInvitation: sendObserverInvitation
};
