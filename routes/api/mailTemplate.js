"use strict";
var MailTemplate = require('./../../models').MailTemplate;
var MailTemplateService = require('./../../services/mailTemplate');
var _ = require('lodash');

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
    logInUrl: "#/LogInUrl",
  };

  var result = MailTemplateService.composeMailFromTemplate(req.body.mailTemplate, mailPreviewVariables);
  if (!result.error) {
    res.send({error: null, template: result});
  } else {
    res.send({error: result.error, template: null});
  }
}
