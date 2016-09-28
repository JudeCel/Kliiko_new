'use strict';

var MailTemplateService = require('./../../services/mailTemplate');
var async = require('async');
var fs = require('fs');
var Minimize = require('minimize');
var constants = require('./../../util/constants');
var q = require('q');

var minimize = new Minimize();
let num = 0;

let templateFiles = [
  {
    fileName: 'InvitationSeries_FirstInvitation.html',
    name: constants.mailTemplateType.firstInvitation,
    type: "firstInvitation",
    subject: "Invitation to {Session Name}",
    systemMessage: false
  },
  {
    fileName: 'InvitationSeries_CloseSession.html',
    name: constants.mailTemplateType.closeSession,
    type: "closeSession",
    subject: "Close {Session Name} session",
    systemMessage: false
  },
  {
    fileName: 'InvitationSeries_Confirmation.html',
    name: constants.mailTemplateType.confirmation,
    type: "confirmation",
    subject: "Invitation confirmed",
    systemMessage: false
  },
  {
    fileName: 'InvitationSeries_Generic.html',
    name: constants.mailTemplateType.generic,
    type: "generic",
    subject: "Invitation",
    systemMessage: false,
    required: false
  },
  {
    fileName: 'InvitationSeries_NotAtAll.html',
    name: constants.mailTemplateType.notAtAll,
    type: "notAtAll",
    subject: "Not At All",
    systemMessage: false
  },
  {
    fileName: 'InvitationSeries_NotThisTime.html',
    name: constants.mailTemplateType.notThisTime,
    type: "notThisTime",
    subject: "Not this time",
    systemMessage: false
  },
  {
    fileName: 'SystemEmail_AccountManagerConfirmation.html',
    name: constants.mailTemplateType.accountManagerConfirmation,
    type: "accountManagerConfirmation",
    subject: "Account Manager Confirmation",
    systemMessage: false
  },
  {
    fileName: 'SystemEmail_ReactivatedAccount.html',
    name: constants.mailTemplateType.reactivatedAccount,
    type: "reactivatedAccount",
    subject: "Your Account Has Been Reactivated",
    systemMessage: true
  },
  {
    fileName: 'SystemEmail_DeactivatedAccount.html',
    name: constants.mailTemplateType.deactivatedAccount,
    type: "deactivatedAccount",
    subject: "Your Account Has Been Deactivated",
    systemMessage: true
  },
  {
    fileName: 'SystemEmail_FacilitatorConfirmation.html',
    name: constants.mailTemplateType.facilitatorConfirmation,
    type: "facilitatorConfirmation",
    subject: "Facilitator Confirmation",
    systemMessage: true
  },
  {
    fileName: 'SystemEmail_ObserverInvitation.html',
    name: constants.mailTemplateType.observerInvitation,
    type: "observerInvitation",
    subject: "Observer Invitation",
    systemMessage: true
  },
  {
    fileName: 'SystemEmail_FacilitatorOverQuota.html',
    name: constants.mailTemplateType.facilitatorOverQuota,
    type: "facilitatorOverQuota",
    subject: "Facilitator Over-Quota",
    systemMessage: true
  },
  {
    fileName: 'SystemEmail_PasswordResetSuccess.html',
    name: constants.mailTemplateType.passwordResetSuccess,
    type: "passwordResetSuccess",
    subject: "Reset password success",
    systemMessage: true
  },
  {
    fileName: 'SystemEmail_PasswordChangeSuccess.html',
    name: constants.mailTemplateType.passwordChangeSuccess,
    type: "passwordChangeSuccess",
    subject: "Change password success",
    systemMessage: true
  },
  {
    fileName: 'SystemEmail_PasswordResetRequest.html',
    name: constants.mailTemplateType.passwordResetRequest,
    type: "passwordResetRequest",
    subject: "Reset password",
    systemMessage: true
  },
  {
    fileName: 'SystemEmail_RegisterConfirmationEmail.html',
    name: constants.mailTemplateType.registerConfirmationEmail,
    type: "registerConfirmationEmail",
    subject: "Verify Email Address",
    systemMessage: true
  },
  {
    fileName: 'SystemEmail_RegisterConfirmationEmailSuccess.html',
    name: constants.mailTemplateType.registerConfirmationEmailSuccess,
    type: "registerConfirmationEmailSuccess",
    subject: "Email Confirmation Success",
    systemMessage: true
  },
  // Popups
  {
    fileName: 'SystemPopup_InvitationAcceptance.html',
    name: constants.mailTemplateType.invitationAcceptance,
    type: "invitationAcceptance",
    subject: "Invitation Acceptance",
    systemMessage: true
  },
  {
    fileName: 'SystemPopup_SessionClosed.html',
    name: constants.mailTemplateType.sessionClosed,
    type: "sessionClosed",
    subject: "Session Closed",
    systemMessage: true
  },
  {
    fileName: 'SystemPopup_SessionFull.html',
    name: constants.mailTemplateType.sessionFull,
    type: "sessionFull",
    subject: "Session Full",
    systemMessage: true
  },
  {
    fileName: 'SystemPopup_SessionNotYetOpen.html',
    name: constants.mailTemplateType.sessionNotYetOpen,
    type: "sessionNotYetOpen",
    subject: "Session Not Yet Open",
    systemMessage: true
  }
];

function createMailTemplateFromFile(fileInfo, callback) {
  readContents(fileInfo.fileName, function (err, data) {
    if (err) {
      return callback(err, null);
    }

    if (data) {
      //if got data from file, minimize it
      minimize.parse(data, function (error, minifiedData) {
        if (error) {
          return callback(err, null);
        }
        let mailTemplateAttrs = {
          name: fileInfo.name,
          subject: fileInfo.subject,
          content: minifiedData,
          systemMessage: fileInfo.systemMessage,
          category: fileInfo.type,
          required: fileInfo.required
        };

        MailTemplateService.createBaseMailTemplate(mailTemplateAttrs, function (err, mailTemplate) {
          callback(err, mailTemplate);
        });
      });
    }
  });
}

function createMailTemplate() {
  let deferred = q.defer();

  num = 0;
  async.waterfall([
    (cb) => { addTemplate(cb) },
    addTemplate,
    addTemplate,
    addTemplate,
    addTemplate,
    addTemplate,
    addTemplate,
    addTemplate,
    addTemplate,
    addTemplate,
    addTemplate,
    addTemplate,
    addTemplate,
    addTemplate,
    addTemplate,
    addTemplate,
    addTemplate,
    addTemplate,
    addTemplate,
    addTemplate,
    addTemplate,
    createMailTemplateCopies
  ], function(error, result) {
    if(error) {
      deferred.reject(filters.errors(error));
    }
    else {
      deferred.resolve();
    }
  });

  return deferred.promise;
}

function addTemplate(callback) {
  createMailTemplateFromFile(templateFiles[num], function (error, _result) {
    if (num < templateFiles.length) {
      num++;
      callback(null);
    }
  })
}

function readContents(fileName, callback) {
  fs.readFile('seeders/mailTemplateFiles/' + fileName, 'utf8', function read(err, data) {
    callback(err, data);
  });
}

function createMailTemplateCopies(callback) {
  MailTemplateService.copyBaseTemplates(function (error, result) {
    callback(error, result);
  });
}

module.exports = {
  createMailTemplate: createMailTemplate
}
