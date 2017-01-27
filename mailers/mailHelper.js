'use strict';
var terms_of_service = require('../lib/terms_of_service');
var helpers = require('./helpers');
var mailTemplate = require('./mailTemplate');
var mailTemplateService = require('../services/mailTemplate');

function sendEmail(templateName, params, callback, passParamsToGetActiveMailTemplate, isCalendarEvent) {
  mailTemplateService.getActiveMailTemplate(templateName, passParamsToGetActiveMailTemplate ? params : null, function(error, result) {
    if (error) {
      return callback(error);
    }
    params.termsOfUseUrl = terms_of_service.filter(params);
    params.privacyPolicyUrl = helpers.getUrl('', null, '/privacy_policy');
    params.systemRequirementsUrl = helpers.getUrl('', null, '/system_requirements');
    let mailContent = mailTemplateService.composeMailFromTemplate(result, params);
    if (mailContent.error) {
      return callback(mailContent.error);
    }
    if (isCalendarEvent) {
      mailTemplate.sendMailWithTemplateAndCalendarEvent(mailContent, params, callback);
    } else {
      mailTemplate.sendMailWithTemplate(mailContent, params, callback);
    }
  });
}

//sent on session close, with future interests
function sendSessionClose(params, callback) {
  sendEmail("closeSession", params, callback, false, false);
};

//provide senders accountId in params, this will take latest template version for this account
function sendFirstInvitation(params, callback) {
  sendEmail("firstInvitation", params, callback, true, true);
};

//provide senders accountId in params, this will take latest template version for this account
function sendInviteConfirmation(params, callback) {
  sendEmail("confirmation", params, callback, true, true);
};

//provide senders accountId in params, this will take latest template version for this account
function sendInvitationNotThisTime(params, callback) {
  sendEmail("notThisTime", params, callback, true, false);
};

//provide senders accountId in params, this will take latest template version for this account
function sendInvitationNotAtAll(params, callback) {
  sendEmail("notAtAll", params, callback, true, false);
};

//provide senders accountId in params, this will take latest template version for this account
function sendGeneric(params, callback) {
  sendEmail("generic", params, callback, true, false);
};

//provide senders accountId in params, this will take latest template version for this account
function sendFacilitatorEmailConfirmation(params, callback) {
  sendEmail("facilitatorConfirmation", params, callback, false, true);
};

//provide senders accountId in params, this will take latest template version for this account
function sendParticipantOverquota(params, callback) {
  sendEmail("facilitatorOverQuota", params, callback, false, false);
};

function sendObserverInvitation(params, callback) {
  sendEmail("observerInvitation", params, callback, false, true);
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
