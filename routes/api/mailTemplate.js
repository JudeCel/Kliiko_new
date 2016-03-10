"use strict";
var MailTemplate = require('./../../models').MailTemplate;
var MailTemplateService = require('./../../services/mailTemplate');
var policy = require('./../../middleware/policy.js');
var _ = require('lodash');

module.exports = {
  mailTemplatePost: mailTemplatePost,
  allMailTemplatesGet: allMailTemplatesGet,
  saveMailTemplatePost: saveMailTemplatePost,
  deleteMailTemplate: deleteMailTemplate,
  resetMailTemplatePost: resetMailTemplatePost,
  previewMailTemplatePost: previewMailTemplatePost
};

function allMailTemplatesGet(req, res, next) {
  MailTemplateService.getAllMailTemplates(res.locals.currentDomain.id, req.query.getSystemMail,function(error, result) {
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
  let shouldOverwrite = policy.hasAccess(res.locals.currentDomain.roles, ['admin']);
  MailTemplateService.saveMailTemplate(req.body.mailTemplate, req.body.copy, res.locals.currentDomain.id, shouldOverwrite,function(error, result) {
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
// fills template with preset data for preview purposes
function previewMailTemplatePost(req, res, next) {
  var result = MailTemplateService.composePreviewMailTemplate(req.body.mailTemplate);
  if (!result.error) {
    res.send({error: null, template: result});
  } else {
    res.send({error: result.error, template: null});
  }
}
