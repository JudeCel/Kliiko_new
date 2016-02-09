'use strict';

var MailTemplateService = require('./../services/mailTemplate');
var async = require('async');
var fs = require('fs');
var Minimize = require('minimize');
var async = require('async');


var minimize = new Minimize();
var num = 0;

var templateFiles = [
  {
    fileName: 'InvitationSeries_FirstInvite.html',
    name: MailTemplateService.mailTemplateType.firstInvitation,
    subject: "Invitation to {Session Name}",
    systemMessage: false
  },
  {
    fileName: 'InvitationSeries_CloseSession.html',
    name: MailTemplateService.mailTemplateType.closeSession,
    subject: "Close {Session Name} session",
    systemMessage: false
  },
  {
    fileName: 'InvitationSeries_Confirmation.html',
    name: MailTemplateService.mailTemplateType.confirmation,
    subject: "Invitation confirmed",
    systemMessage: false
  },
  {
    fileName: 'InvitationSeries_Generic.html',
    name: MailTemplateService.mailTemplateType.generic,
    subject: "Invitation",
    systemMessage: false
  },
  {
    fileName: 'InvitationSeries_NotAtAll.html',
    name: MailTemplateService.mailTemplateType.notAtAll,
    subject: "Not At All",
    systemMessage: false
  },
  {
    fileName: 'InvitationSeries_NotThisTime.html',
    name: MailTemplateService.mailTemplateType.notThisTime,
    subject: "Not this time",
    systemMessage: false
  },
  {
    fileName: 'SystemEmail_AccountManagerConfirmation.html',
    name: MailTemplateService.mailTemplateType.accountManagerConfirmation,
    subject: "Account Manager Confirmation",
    systemMessage: false
  },
  {
    fileName: 'SystemEmail_ReactivatedAccount.html',
    name: MailTemplateService.mailTemplateType.reactivatedAccount,
    subject: "Your Account Has Been Reactivated",
    systemMessage: true
  },
  {
    fileName: 'SystemEmail_DeactivatedAccount.html',
    name: MailTemplateService.mailTemplateType.deactivatedAccount,
    subject: "Your Account Has Been Deactivated",
    systemMessage: true
  },
  {
    fileName: 'SystemEmail_FacilitatorConfirmation.html',
    name: MailTemplateService.mailTemplateType.facilitatorConfirmation,
    subject: "Facilitator Confirmation",
    systemMessage: true
  },
  {
    fileName: 'SystemEmail_ObserverInvitation.html',
    name: MailTemplateService.mailTemplateType.observerInvitation,
    subject: "Observer Invitation",
    systemMessage: true
  },
  {
    fileName: 'SystemEmail_FacilitatorOverQuota.html',
    name: MailTemplateService.mailTemplateType.facilitatorOverQuota,
    subject: "Facilitator Over-Quota",
    systemMessage: true
  },
  // Popups
  {
    fileName: 'SystemPopup_InvitationAcceptance.html',
    name: MailTemplateService.mailTemplateType.invitationAcceptance,
    subject: "Invitation Acceptance",
    systemMessage: true
  },
  {
    fileName: 'SystemPopup_SessionClosed.html',
    name: MailTemplateService.mailTemplateType.sessionClosed,
    subject: "Session Closed",
    systemMessage: true
  },
  {
    fileName: 'SystemPopup_SessionFull.html',
    name: MailTemplateService.mailTemplateType.sessionFull,
    subject: "Session Full",
    systemMessage: true
  },
  {
    fileName: 'SystemPopup_SessionNotOpenYet.html',
    name: MailTemplateService.mailTemplateType.sessionNotYetOpen,
    subject: "Session Not Yet Open",
    systemMessage: true
  },
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
          category: fileInfo.name
        };

        MailTemplateService.createBaseMailTemplate(mailTemplateAttrs, function (err, mailTemplate) {
          callback(err, mailTemplate);
        });
      });
    }
  });
}

function createMailTemplate() {
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
    createMailTemplateCopies
  ]);
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
  fs.readFile('./seeders/mailTemplateFiles/' + fileName, 'utf8', function read(err, data) {
    callback(err, data);
  });
}

function copyFromMailTemplates(callback) {
  MailTemplateService.copyBaseTemplates(function (error, result) {
    callback(error, result);
  });
}

function createMailTemplateCopies() {
  copyFromMailTemplates(function (error, _result) {
    process.exit();
  });
}

createMailTemplate();
