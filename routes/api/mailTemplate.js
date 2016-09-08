"use strict";
var MailTemplate = require('./../../models').MailTemplate;
var MailTemplateService = require('./../../services/mailTemplate');
var MessagesUtil = require('./../../util/messages');
var policy = require('./../../middleware/policy.js');
var _ = require('lodash');

module.exports = {
  mailTemplatePost: mailTemplatePost,
  allMailTemplatesGet: allMailTemplatesGet,
  saveMailTemplatePost: saveMailTemplatePost,
  deleteMailTemplate: deleteMailTemplate,
  resetMailTemplatePost: resetMailTemplatePost,
  previewMailTemplatePost: previewMailTemplatePost,
  allSessionMailTemplatesGet: allSessionMailTemplatesGet
};

function allSessionMailTemplatesGet(req, res, next) {
  let sessionId = null;
  if(req.query.params){
    sessionId = JSON.parse(req.query.params).sessionId;
  }

  MailTemplateService.getAllSessionMailTemplates(res.locals.currentDomain.id, true, sessionId, req.query.getSystemMail, false,function(error, result) {
    res.send({error: error, templates: result});
  });
}

function allMailTemplatesGet(req, res, next) {
  let accountId;
  if (!policy.hasAccess(res.locals.currentDomain.roles, ['admin'])) {
    accountId = res.locals.currentDomain.id;
  }

  MailTemplateService.getAllMailTemplates(accountId, true, req.query.getSystemMail, false, function(error, result) {
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
  let canOverwrite = policy.hasAccess(res.locals.currentDomain.roles, ['admin']);
  let makeCopy = !canOverwrite ? req.body.copy : false;

  let sessionId = req.body.mailTemplate.properties && req.body.mailTemplate.properties.sessionId;
  var accountId = canOverwrite && !sessionId ? null : res.locals.currentDomain.id;
  MailTemplateService.saveMailTemplate(req.body.mailTemplate, makeCopy, accountId,function(error, result) {
    res.send({error: error, templates: result, message: MessagesUtil.routes.mailTemplates.saved });
  });
}

function deleteMailTemplate(req, res, next) {
  MailTemplateService.deleteMailTemplate(req.query.mailTemplateId, function(error, result) {
    res.send({error: error});
  });
}

function resetMailTemplatePost(req, res, next) {
  MailTemplateService.resetMailTemplate(req.body.mailTemplateId, req.body.mailTemplateBaseId, req.body.isCopy, function(error, result) {
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
