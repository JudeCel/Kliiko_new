"use strict";
var MailTemplate = require('./../../models').MailTemplate;
var MailTemplateService = require('./../../services/mailTemplate');
var BrandColourService = require('./../../services/brandColour');
var MessagesUtil = require('./../../util/messages');
var policy = require('./../../middleware/policy.js');
var sessionBuilderSnapshotValidationService = require('./../../services/sessionBuilderSnapshotValidation');
var _ = require('lodash');

module.exports = {
  mailTemplatePost: mailTemplatePost,
  allMailTemplatesGet: allMailTemplatesGet,
  allMailTemplatesWithColorsGet: allMailTemplatesWithColorsGet,
  saveMailTemplatePost: saveMailTemplatePost,
  deleteMailTemplate: deleteMailTemplate,
  resetMailTemplatePost: resetMailTemplatePost,
  previewMailTemplatePost: previewMailTemplatePost,
  allSessionMailTemplatesGet: allSessionMailTemplatesGet,
  allSessionMailTemplatesWithColorsGet: allSessionMailTemplatesWithColorsGet,
  sendMail: sendMail
};

function allSessionMailTemplatesGet(req, res, next) {
  let sessionId = null;
  if(req.query.params){
    sessionId = JSON.parse(req.query.params).sessionId;
  }

  MailTemplateService.getAllSessionMailTemplates(req.currentResources.account.id, true, sessionId, req.query.getSystemMail, false,function(error, result) {
    res.send({error: error, templates: result});
  });
}

function allSessionMailTemplatesWithColorsGet(req, res, next) {
  let sessionId = null;
  if(req.query.params){
    sessionId = JSON.parse(req.query.params).sessionId;
  }

  MailTemplateService.getAllSessionMailTemplates(req.currentResources.account.id, true, sessionId, req.query.getSystemMail, false,function(error, result) {
    if (req.query.brandProjectPreferenceId && req.query.brandProjectPreferenceId > 0) {
      BrandColourService.findScheme({ id: req.query.brandProjectPreferenceId }, req.currentResources.account.id).then(function (colorsResult) {
        res.send({error: error, templates: result, colors: colorsResult.data.colours, manageFields: BrandColourService.manageFields()});
      }, function(error) {
        res.send({error: error});
      });
    } else {
      res.send({error: error, templates: result, colors: null, manageFields: BrandColourService.manageFields()});
    }
  });
}

function allMailTemplatesGet(req, res, next) {
  let accountId;
  if (!policy.hasAccess(req.currentResources.accountUser.role, ['admin'])) {
    accountId = req.currentResources.account.id;
  }

  MailTemplateService.getAllMailTemplates(accountId, true, req.query.getSystemMail, false, function(error, result) {
    res.send({error: error, templates: result});
  });
}

function allMailTemplatesWithColorsGet(req, res, next) {
  let accountId;
  let isAdmin = policy.hasAccess(req.currentResources.accountUser.role, ['admin']);
  if (!isAdmin) {
    accountId = req.currentResources.account.id;
  }

  MailTemplateService.getAllMailTemplates(accountId, true, req.query.getSystemMail, false, function (error, result) {
    if (req.query.brandProjectPreferenceId && req.query.brandProjectPreferenceId > 0) {
      BrandColourService.findScheme({ id: req.query.brandProjectPreferenceId }, req.currentResources.account.id).then(function (colorsResult) {
        res.send({error: error, templates: result, colors: colorsResult.data.colours, manageFields: BrandColourService.manageFields()});
      }, function(error) {
        res.send({error: error});
      });
    } else {
      res.send({error: error, templates: result, colors: null, manageFields: BrandColourService.manageFields()});
    }
  }, isAdmin);
}

//get mail template by "id"
function mailTemplatePost(req, res, next) {
  MailTemplateService.getMailTemplate(req.body.mailTemplate, function(error, result) {
    if (result.sessionId) {
      let snapshot = sessionBuilderSnapshotValidationService.getMailTemplateSnapshot(result);
      res.send({error: error, template: result, snapshot: snapshot});
    } else {
      res.send({error: error, template: result});
    }
  });
}

function saveMailTemplatePost(req, res, next) {
  let isAdmin = policy.hasAccess(req.currentResources.accountUser.role, ['admin']);
  let sessionId = req.body.mailTemplate.properties && req.body.mailTemplate.properties.sessionId;
  let makeCopy = isAdmin && !sessionId ? false : req.body.copy;
  let accountId = isAdmin && !sessionId ? null : req.currentResources.account.id;
  MailTemplateService.saveMailTemplate(req.body.mailTemplate, makeCopy, accountId, isAdmin, req.body.sessionId, function(error, result) {
    if (result && result.validation && !result.validation.isValid) {
      res.send(result);
    } else if (error) {
      res.send({ error: error });
    } else {
      res.send({ templates: result, message: MessagesUtil.routes.mailTemplates.saved });
    }
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
  MailTemplateService.composePreviewMailTemplate(req.body.mailTemplate, req.body.sessionId, function(result) {
    if (!result.error) {
      res.send({error: null, template: result});
    } else {
      res.send({error: result.error, template: null});
    }
  });
}

function sendMail(req, res, next) {
  MailTemplateService.sendTestEmail(req.body.mailTemplate, req.body.sessionId, req.currentResources.accountUser.id, function(error, data) {
    if (error) {
      res.send({ error: error });
    } else {
      res.send({ data: data, message: MessagesUtil.mailTemplate.testMailSent });
    }
  });
}
