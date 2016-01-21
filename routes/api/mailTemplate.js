"use strict";
var MailTemplate = require('./../../models').MailTemplate;
var MailTemplateService = require('./../../services/mailTemplate');
var _ = require('lodash');
var ejs = require('ejs');

module.exports = {
  mailTemplatesGet: mailTemplatesGet,
  mailTemplatePost: mailTemplatePost,
  allMailTemplatesGet: allMailTemplatesGet,
  saveMailTemplatePost: saveMailTemplatePost,
  deleteMailTemplate: deleteMailTemplate,
  resetMailTemplatePost: resetMailTemplatePost,
  previewMailTemplatePost: previewMailTemplatePost
};

var templateFields = [
    'id',
    'name',
    'subject',
    'content',
];

function mailTemplatesGet(req, res, next) {
  MailTemplate.find({
    where: {
      id: req.mailTemplate.id,
    },
    attributes: templateFields,
    raw: true,
  }).then(function (result) {
      res.send(result);
  }).catch(function (err) {
    res.send({error: err});
  });
}

function allMailTemplatesGet(req, res, next) {
  MailTemplateService.getAllMailTemplates(req.user, function(error, result) {
    res.send({error: error, templates: result});
  });
}

//get mail template by "id"
function mailTemplatePost(req, res, next) {
  MailTemplateService.getMailTemplate(req.body.mailTemplate, function(error, result) {
    res.send({error: error, template: result});
  });
}


function saveMailTemplatePost(req, res, next) {
  MailTemplateService.saveMailTemplate(req.body.mailTemplate, req.body.copy, req.user.id,function(error, result) {
    res.send({error: error, templates: result});
  });
}

function deleteMailTemplate(req, res, next) {
  MailTemplateService.deleteMailTemplate(req.query.mailTemplateId, function(error, result) {
    res.send({error: error});
  });
}

function resetMailTemplatePost(req, res, next) {
  MailTemplateService.resetMailTemplate(req.body.mailTemplateId, function(error, result) {
    res.send({error: error, template: result});
  });
}
// accepts template object from client - in case if user tests unsaved HTML
// use as reference for future use
function previewMailTemplatePost(req, res, next) {
  try {
    var result = formatMailTemplate(req.body.mailTemplate)
    let mailPreviewVariables = {
        firstName: "John",
        lastName: "Smith",
        accountName: "peter",
        startDate: new Date().toLocaleDateString(),
        startTime: new Date().toLocaleTimeString(),
        endDate: new Date().toLocaleDateString(),
        endTime: new Date().toLocaleTimeString(),
        facilitatorFirstName: "Peter",
        facilitatorLastName: "Anderson",
        facilitatorMail: "peter@mail.com",
        participantMail: "john@mail.com",
        facilitatorMobileNumber: "29985762",
        sessionName: "Test Session",
        incentive: "test incentive",
        acceptInvitationUrl: "#/acceptInvitationUrl",
        invitationNotThisTimeUrl: "#/invitationNotThisTimeUrl",
        invitationNotAtAllUrl: "#/invitationNotAtAllUrl",
        unsubscribeMailUrl: "#/unsubscribeMailUrl",
        participateInFutureUrl: "#/participateInFutureUrl",
        dontParticipateInFutureUrl: "#/dontParticipateInFutureUrl",
        confirmationCheckInUrl: "#/confirmationCheckInUrl",
        accountManagerConfirmationLogInUrl: "#/accountManagerConfirmationLogInUrl",
    };
    result.content = ejs.render(result.content, mailPreviewVariables);
    result.subject = ejs.render(result.subject, mailPreviewVariables);
    
    return res.send({error: null, template: result});
  } catch (err) {
    console.log("error constructing mail template:", err);
    return res.send({error: "error constructing mail template:", template: null});
  }
}

//replace templates "In Editor" variables with .ejs compatible variables
//in HTML content and subject
function formatMailTemplate(template) {
  template.content = formatTemplateString(template.content);
  template.subject = formatTemplateString(template.subject);
  
  return template;
}

//replace all "In Editor" variables with .ejs compatible variables
function formatTemplateString(str) {
  str = str.replace(/\{First Name\}/ig, "<%= firstName %>");
  str = str.replace(/\{Last Name\}/ig, "<%= lastName %>");
  str = str.replace(/\{Account Name\}/ig, "<%= accountName %>");
  str = str.replace(/\{Start Date\}/ig, "<%= startDate %>");
  str = str.replace(/\{Start Time\}/ig, "<%= startTime %>");
  str = str.replace(/\{End Date\}/ig, "<%= endDate %>");
  str = str.replace(/\{End Time\}/ig, "<%= endTime %>");
  str = str.replace(/\{Facilitator First Name\}/ig, "<%= facilitatorFirstName %>");
  str = str.replace(/\{Facilitator Last Name\}/ig, "<%= facilitatorLastName %>");
  str = str.replace(/\{Facilitator Email\}/ig, "<%= facilitatorMail %>");
  str = str.replace(/\{Participant Email\}/ig, "<%= participantMail %>");
  str = str.replace(/\{Facilitator Mobile\}/ig, "<%= facilitatorMobileNumber %>");
  str = str.replace(/\{Session Name\}/ig, "<%= sessionName %>");
  str = str.replace(/\{Incentive\}/ig, "<%= incentive %>"); 
  str = str.replace(/\{Accept Invitation\}/ig, "<%= acceptInvitationUrl %>");
  str = str.replace(/\{Invitation Not This Time\}/ig, "<%= invitationNotThisTimeUrl %>");
  
  str = str.replace(/\{Invitation At All\}/ig, "<%= invitationNotAtAllUrl %>");
  str = str.replace(/\{Mail Unsubscribe\}/ig, "<%= unsubscribeMailUrl %>");
  str = str.replace(/\{Close Session Yes In Future\}/ig, "<%= participateInFutureUrl %>");
  str = str.replace(/\{Close Session No In Future\}/ig, "<%= dontParticipateInFutureUrl %>");
  str = str.replace(/\{Confirmation Check In\}/ig, "<%= confirmationCheckInUrl %>");
  str = str.replace(/\{Account Manager Confirmation Login\}/ig, "<%= accountManagerConfirmationLogInUrl %>");
  
  return str;
}
