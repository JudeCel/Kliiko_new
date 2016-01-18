'use strict';

var MailTemplateService = require('./../services/mailTemplate');
var async = require('async');
var fs = require('fs');

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

function createTestMailTemplate(fileInfo, callback) {
  readContents(fileInfo.fileName , function(error, data) {   
    let mailTemplateAttrs = {
      name: fileInfo.name,
      subject: fileInfo.subject,
      content: data
    }
    
    MailTemplateService.createBaseMailTemplate(mailTemplateAttrs, function(err, mailTemplate) {
        callback(err, mailTemplate); 
    });
  });
}

function createMailTemplate() {
  //Todo setup filling templates with async waterfall  
 /* createTestMailTemplate(templateFiles[0], function(error, _result) {
    createTestMailTemplate(templateFiles[1], function(error, _result) {
    });  
  });
  */
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
  createTestMailTemplate(templateFiles[num], function(error, _result) {
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
