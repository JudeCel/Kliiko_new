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
    name: "First Invitation",
    subject: "Invitation to {Session Name}",
    systemMessage: 0
  },
  {
    fileName: 'InvitationSeries_CloseSession.html',
    name: "Close Session",
    subject: "Close {Session Name} session",
    systemMessage: 0
  },
  {
    fileName: 'InvitationSeries_Confirmation.html',
    name: "Confirmation",
    subject: "Invitation confirmed",
    systemMessage: 0
  },
  {
    fileName: 'InvitationSeries_Generic.html',
    name: "Generic",
    subject: "Invitation",
    systemMessage: 0
  },
  {
    fileName: 'InvitationSeries_NotAtAll.html',
    name: "Not At All",
    subject: "Not At All",
    systemMessage: 0
  },
  {
    fileName: 'InvitationSeries_NotThisTime.html',
    name: "Not This Time",
    subject: "Not this time",
    systemMessage: 0
  },
  {
    fileName: 'SystemEmail_AccountManagerConfirmation.html',
    name: "Account Manager Confirmation",
    subject: "Account Manager Confirmation",
    systemMessage: 0
  },
  {
    fileName: 'SystemEmail_ReactivatedAccount.html',
    name: "Reactivated Account",
    subject: "Your Account Has Been Reactivated",
    systemMessage: 1
  },
  {
    fileName: 'SystemEmail_DeactivatedAccount.html',
    name: "Deactivated Account",
    subject: "Your Account Has Been Deactivated",
    systemMessage: 1
  },
  {
    fileName: 'SystemEmail_FacilitatorConfirmation.html',
    name: "Facilitator Confirmation",
    subject: "Facilitator Confirmation",
    systemMessage: 1
  },
  {
    fileName: 'SystemEmail_ObserverInvitation.html',
    name: "Observer Invitation",
    subject: "Observer Invitation",
    systemMessage: 1
  },
  {
    fileName: 'SystemEmail_FacilitatorOverQuota.html',
    name: "Facilitator Over-Quota",
    subject: "Facilitator Over-Quota",
    systemMessage: 1
  },
  // Popups
  {
    fileName: 'SystemPopup_InvitationAcceptance.html',
    name: "Invitation Acceptance",
    subject: "Invitation Acceptance",
    systemMessage: 1
  },
  {
    fileName: 'SystemPopup_SessionClosed.html',
    name: "Session Closed",
    subject: "Session Closed",
    systemMessage: 1
  },
  {
    fileName: 'SystemPopup_SessionFull.html',
    name: "Session Full",
    subject: "Session Full",
    systemMessage: 1
  },
  {
    fileName: 'SystemPopup_SessionNotOpenYet.html',
    name: "Session Not Yet Open",
    subject: "Session Not Yet Open",
    systemMessage: 1
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
          systemMessage: fileInfo.systemMessage
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
