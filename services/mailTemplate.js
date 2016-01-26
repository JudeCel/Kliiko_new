"use strict";

var MailTemplate  = require('./../models').MailTemplate;
var MailTemplateOriginal  = require('./../models').MailTemplateBase;
var templateMailer = require('../mailers/mailTemplate');
var _ = require('lodash');
var ejs = require('ejs');

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
    callback(err, null);
  }).catch(function(err) {
    callback(err, null);
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
      id: req.id
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

function deleteMailTemplate(id, callback) {
  if (!id) {
      return callback("e-mail template id not provided");
  }
  MailTemplate.destroy({ where: { id: id, $not: [{id: null}] } }).then(function() {
    callback(null, {});
  }).catch(function(error) {
    callback(error);
  }); 
}

//replace templates "In Editor" variables with .ejs compatible variables
//in HTML content and subject
function composeMailFromTemplate(template, params) {
  try {
    template.content = formatTemplateString(template.content);
    template.subject = formatTemplateString(template.subject);
    template.content = ejs.render(template.content, params);
    template.subject = ejs.render(template.subject, params);
    
    return template;
  } catch (error) {
    console.log("error constructing mail template:", error);
    return {error: "Error constructing mail template"};
  }
}

function sendMailFromTemplate(id, params, callback) {
  getMailTemplate({id: id}, function(error, result) {
    if (error) {
        return callback(error);
    }

    var mailContent = composeMailFromTemplate(result, params);
    if (mailContent.error) {
        return callback(mailContent.error);
    }
    templateMailer.sendMailWithTemplate(mailContent, params, callback);
  });
}

function sendMailFromTemplateWithCalendarEvent(id, params, callback) {
  getMailTemplate({id: id}, function(error, result) {
    if (error) {
        return callback(error);
    }

    var mailContent = composeMailFromTemplate(result, params);
    if (mailContent.error) {
        return callback(mailContent.error);
    }
    templateMailer.sendMailWithTemplateAndCalendarEvent(mailContent, params, callback);
  });
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
  resetMailTemplate: resetMailTemplate,
  composeMailFromTemplate: composeMailFromTemplate,
  sendMailFromTemplate: sendMailFromTemplate,
  sendMailFromTemplateWithCalendarEvent: sendMailFromTemplateWithCalendarEvent
}
