"use strict";

var MailTemplate  = require('./../models').MailTemplateCopy;
var MailTemplateOriginal  = require('./../models').MailTemplate;
var _ = require('lodash');

var originalTemplateFields = [
    'id',
    'name',
    'subject',
    'content'
];

var templateFields = [
    'id',
    'name',
    'subject',
    'content',
    'MailTemplateId'
];

var templateFieldsForList = [
    'id',
    'name',
    'MailTemplateId'
];

function validate(params, callback) {
  let attrs = {name: params.accountName}
  MailTemplate.build(attrs).validate().done(function(errors, _account) {
    callback(errors, params);
  });
}
function createBaseMailTemplate(params, callback) {
  MailTemplateOriginal.create(params).then(function(result) {
    callback(null, result);
  }).catch(MailTemplateOriginal.sequelize.ValidationError, function(err) {
    callback(prepareErrors(err), null);
  }).catch(function(err) {
    callback(prepareErrors(err), null);
  });
}

function create(params, callback) {
  MailTemplate.create(params).then(function(result) {
    callback(null, result);
  }).catch(MailTemplate.sequelize.ValidationError, function(err) {
    callback(prepareErrors(err), null);
  }).catch(function(err) {
    callback(prepareErrors(err), null);
  });
}

function update(id, parameters, callback){
    MailTemplate.update(parameters, {
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
  MailTemplate.find({
    include: [{ model: MailTemplateOriginal, attributes: ['id', 'name']}],
    where: {
      id: req.id,
    },
    attributes: templateFields,
    raw: true,
  }).then(function (result) {
    callback(null, result);
  }).catch(function (err) {
    callback(err, null);
  });
}

function getAllMailTemplates(req, callback) {
  MailTemplate.findAll({
      include: [{ model: MailTemplateOriginal, attributes: ['id', 'name']}],
      where: {
        $or: [{UserId: req.id}, {UserId: null}]
      },
      attributes: templateFieldsForList,
      raw: true
  }).then(function(result) {
      callback(null, result);
  }).catch(function(error) {
    callback(error);
  });
};

function copyBaseTemplates(callback) {
  MailTemplateOriginal.findAll({
      attributes: originalTemplateFields,
      raw: true
  }).then(function(result) {
    for (var i = 0; i < result.length; i++) {
        result[i].MailTemplateId = result[i].id;
        delete result[i]["id"];
    }
    MailTemplate.bulkCreate(result).done(function(res) {
       callback(null, res);
    }, function(err) {
       callback(err, null);
    })
  }).catch(function(error) {
    callback(error, null);
  });
}

function saveMailTemplate(template, callback) {
  if (!template) {
      return callback("e-mail template not provided", null);
  }
  
  var id = template.id;
  delete template["id"];
  console.log("saving new data:", template);
  if (id == template["MailTemplate.id"]) {
    create(template, function(error, result) {
        callback(error, result);  
    });
  } else {
    update(id, template, function(error, result) {
      callback(error, result);  
    });
  }
}

module.exports = {
  validate: validate,
  create: create,
  update: update,
  getAllMailTemplates: getAllMailTemplates,
  getMailTemplate: getMailTemplate,
  saveMailTemplate: saveMailTemplate,
  createBaseMailTemplate: createBaseMailTemplate,
  copyBaseTemplates: copyBaseTemplates
}
