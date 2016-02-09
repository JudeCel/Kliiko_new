"use strict";

var MailTemplateCopy  = require('./../models').MailTemplateBase;
var _ = require('lodash');

var templateFields = [
    'id',
    'name',
    'subject',
    'content',
];


function validate(params, callback) {
  let attrs = {name: params.accountName}
  MailTemplateCopy.build(attrs).validate().done(function(errors, _account) {
    callback(errors, params);
  });
}

function create(params, callback) {
  MailTemplateCopy.create(params).then(function(result) {
    callback(null, result);
  }).catch(MailTemplateCopy.sequelize.ValidationError, function(err) {
    callback(prepareErrors(err), null);
  }).catch(function(err) {
    callback(prepareErrors(err), null);
  });
}

function update(id, parameters, callback){
    MailTemplateCopy.update(parameters, {
      where: {id: id}
    })
    .then(function (result) {
      return callback(null, result);
    })
    .catch(function (err) {
        callback(err);
    });
}

function prepareErrors(err) {
  let errors = ({});
  _.map(err.errors, function (n) {
    errors[n.path] = _.startCase(n.path) + ':' + n.message.replace(n.path, '');
  });
  return errors;
};

function getMailTemplate(req, callback) {
  MailTemplateCopy.find({
    where: {
      id: req.id,
    },
    attributes: templateFields,
    raw: true,
  }).then(function (result) {
    callback(null, result);
  }).catch(MailTemplateCopy.sequelize.ValidationError, function(err) {
    callback(err, null);
  }).catch(function (err) {
    callback(err, null);
  });
}

function getAllMailTemplates(callback) {
  MailTemplateCopy.findAll({
      attributes: templateFields,
      raw: true
  }).then(function(templates) {
    callback(null, templates);
  }).catch(function(error) {
    callback(error);
  });
};

module.exports = {
  validate: validate,
  create: create,
  update: update,
  getAllMailTemplates: getAllMailTemplates
}
