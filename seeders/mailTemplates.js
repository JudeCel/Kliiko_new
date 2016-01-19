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
       subject: "Exclusive Invitation to <SessionName> Online Chat Group"
     },
     {
       fileName: 'InvitationSeries_CloseSession.html',
       name: "CloseSession",
       subject: "InvitationSeries CloseSession subject"
     },//
     {
       fileName: 'InvitationSeries_Confirmation.html',
       name: "Confirmation",
       subject: "InvitationSeries CloseSession subject"
     },
     {
       fileName: 'InvitationSeries_Generic.html',
       name: "Generic",
       subject: "InvitationSeries CloseSession subject"
     },
     {
       fileName: 'InvitationSeries_NotAtAll.html',
       name: "NotAtAll",
       subject: "InvitationSeries CloseSession subject"
     },
     {
       fileName: 'InvitationSeries_NotThisTime.html',
       name: "NotThisTime",
       subject: "InvitationSeries CloseSession subject"
     },
     {
       fileName: 'SystemEmail_AccountManagerConfirmation.html',
       name: "AccountManagerConfirmation",
       subject: "InvitationSeries CloseSession subject"
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
