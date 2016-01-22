'use strict';

var MailTemplateService = require('./../services/mailTemplate');
var async = require('async');
var fs = require('fs');
var Minimize = require('minimize');
var minimize = new Minimize();
var num = 0;

var templateFiles = [
    {
       fileName: 'InvitationSeries_FirstInvite.html',
       name: "First Invitation",
       subject: "Invitation to {Session Name}",
       category: 1
     },
     {
       fileName: 'InvitationSeries_CloseSession.html',
       name: "Close Session",
       subject: "Close {Session Name} session",
       category: 1
     },
     {
       fileName: 'InvitationSeries_Confirmation.html',
       name: "Confirmation",
       subject: "Invitation confirmed",
       category: 1
     },
     {
       fileName: 'InvitationSeries_Generic.html',
       name: "Generic",
       subject: "Invitation"
     },
     {
       fileName: 'InvitationSeries_NotAtAll.html',
       name: "Not At All",
       subject: "Not At All"
     },
     {
       fileName: 'InvitationSeries_NotThisTime.html',
       name: "Not This Time",
       subject: "Not this time"
     },
     {
       fileName: 'SystemEmail_AccountManagerConfirmation.html',
       name: "Account Manager Confirmation",
       subject: "Account Manager Confirmation"
     }     
];

function createMailTemplateFromFile(fileInfo, callback) {
  readContents(fileInfo.fileName , function(err, data) {
    if (err) {
      console.log("failed to read HTML:", fileInfo.fileName, "; error:", err);
      return callback(err, null);
    }
    
    if (data) {
      //if got data from file, minimize it
      minimize.parse(data, function (error, minifiedData) {
        if (error) {
          console.log("failed to compile HTML:", err);
          return callback(err, null);
        }
        let mailTemplateAttrs = {
          name: fileInfo.name,
          subject: fileInfo.subject,
          content: minifiedData
        };
        
        MailTemplateService.createBaseMailTemplate(mailTemplateAttrs, function(err, mailTemplate) {
          callback(err, mailTemplate); 
        });
      });
    }    
  });
}

function createMailTemplate() {
  async.waterfall([
    (cb) => {addTemplate(cb)},
    addTemplate,
    addTemplate,
    addTemplate,
    addTemplate,
    addTemplate,
    addTemplate,
    addTemplate     
  ]);
}

function addTemplate(callback) {       
  createMailTemplateFromFile(templateFiles[num], function(error, _result) {
    if (num < 7) {
      num++;
      callback(null);
    } else {
      process.exit();
    }
  })
}

function readContents(fileName, callback) {
  fs.readFile('./seeders/mailTemplateFiles/' + fileName, 'utf8', function read(err, data) {      
    callback(err, data);    
  });
}

createMailTemplate();
