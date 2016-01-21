"use strict";

var MailTemplate  = require('./../models').MailTemplate;
var MailTemplateOriginal  = require('./../models').MailTemplateBase;
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
    'MailTemplateBaseId',
    'UserId'
];

var templateFieldsForList = [
    'id',
    'name',
    'MailTemplateBaseId',
    'UserId'
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

//get mail template with all fields base table and id from copy table
function getMailTemplateForReset(req, callback) {
  MailTemplate.find({
    include: [{ model: MailTemplateOriginal, attributes: originalTemplateFields}],
    where: {
      id: req.id,
    },
    attributes: templateFieldsForList,
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
        result[i].MailTemplateBaseId = result[i].id;
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

function saveMailTemplate(template, createCopy, userId, callback) {
  if (!template) {
      return callback("e-mail template not provided", null);
  }
  var id = template.id;
  delete template["id"];
  //a template wasn't created by user - an orinal
  if (!template["UserId"] || createCopy) {
    template.UserId = userId;
    create(template, function(error, result) {
        callback(error, result);  
    });
  } else {
    update(id, template, function(error, result) {
      callback(error, result);  
    });
  }
}

function resetMailTemplate(templateId, callback) {
  if (!templateId) {
      return callback("e-mail template not provided", null);
  }
  
  getMailTemplateForReset({id: templateId}, function(err, result) {
    if (result) {
      //is template created by user - not base version
      if (!result.UserId) {
        //is base version
        callback("you cannot reset template base version", null);      
      } else {
        update(templateId, {name: result["MailTemplate.name"], subject: result["MailTemplate.subject"], content: result["MailTemplate.content"]}, function(error, result) {
           callback(error, result);  
        });
      }
    }
  });
}

function deleteMailTemplate(template, callback) {
  if (!template) {
      return callback("e-mail template not provided");
  }
  
  var id = template;
  if (!id) {
      return callback("e-mail template id not provided");
  }
  MailTemplate.destroy({ where: { id: id, $not: [{id: null}] } }).then(function() {
    callback(null, {});
  }).catch(function(error) {
    callback(error);
  }); 
}

module.exports = {
  validate: validate,
  create: create,
  update: update,
  getAllMailTemplates: getAllMailTemplates,
  getMailTemplate: getMailTemplate,
  saveMailTemplate: saveMailTemplate,
  createBaseMailTemplate: createBaseMailTemplate,
  copyBaseTemplates: copyBaseTemplates,
  deleteMailTemplate: deleteMailTemplate,
  resetMailTemplate: resetMailTemplate
}
