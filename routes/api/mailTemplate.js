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
  resetMailTemplatePost: resetMailTemplatePost
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
