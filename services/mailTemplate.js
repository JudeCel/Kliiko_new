"use strict";

var MailTemplate  = require('./../models').MailTemplate;
var MailTemplateOriginal  = require('./../models').MailTemplateBase;
var templateMailer = require('../mailers/mailTemplate');
var _ = require('lodash');
var ejs = require('ejs');
var constants = require('../util/constants');

var mailTemplateType = {
  firstInvitation : "First Invitation",
  closeSession : "Close Session",
  confirmation : "Confirmation",
  generic : "Generic",
  notAtAll : "Not At All",
  notThisTime : "Not This Time",
  accountManagerConfirmation : "Account Manager Confirmation",
  reactivatedAccount : "Reactivated Account",
  deactivatedAccount : "Deactivated Account",
  facilitatorConfirmation : "Facilitator Confirmation",
  observerInvitation : "Observer Invitation",
  facilitatorOverQuota : "Facilitator Over-Quota",
  invitationAcceptance : "Invitation Acceptance",
  sessionClosed : "Session Closed",
  sessionFull : "Session Full",
  sessionNotYetOpen : "Session Not Yet Open",
  passwordResetSuccess: "Reset password Success"
};

function validate(params, callback) {
  MailTemplate.build(params).validate().done(function(errors, _account) {
    callback(errors, params);
  });
}

function createBaseMailTemplate(params, callback) {
  MailTemplateOriginal.create(params).then(function(result) {
    callback(null, result);
  }).catch(MailTemplateOriginal.sequelize.ValidationError, function(err) {
    callback(prepareErrors(err));
  }).catch(function(err) {
    callback(prepareErrors(err));
  });
}

function create(params, callback) {
  MailTemplate.create(params).then(function(result) {
    callback(null, result);
  }).catch(MailTemplate.sequelize.ValidationError, function(err) {
    callback(err);
  }).catch(function(err) {
    callback(err);
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
    where: {id: req.id},
    attributes: constants.mailTemplateFields,
    raw: true
  }).then(function (result) {
    callback(null, result);
  }).catch(function (err) {
    callback(err);
  });
}

function getBaseMailTemplate(req, callback) {
  MailTemplateOriginal.find({
    where: {id: req.id},
    attributes: constants.mailTemplateFields,
    raw: true
  }).then(function (result) {
      callback(null, result);
  }).catch(function (err) {
    callback(err);
  });
}
/**
 * Get active global mail template by category name
 * @param category constant from ``` mailTemplateType.firstInvitation ```
 * @returns {error, resultMailTemplate} result mail template will be either a copy or original version
 */
function getActiveMailTemplate(category, callback) {
  //getting mail template original version by category name
  MailTemplateOriginal.find({
    where: {
      category: category
    },
    attributes: constants.originalMailTemplateFields,
    raw: true
  }).then(function (result) {
    //get reference to active mail template copy
    getMailTemplate({id: result.mailTemplateActive, or: result.id}, function(err, template) {
      if (!template) {
        callback(null, result);
      } else {
        //returning mail from default table instead
        callback(null, template);
      }
    });
  }).catch(function (err) {
    callback(err);
  });
}

//get mail template with all fields base table and id from copy table
function getMailTemplateForReset(req, callback) {
  MailTemplate.find({
    include: [{ model: MailTemplateOriginal, attributes: constants.originalMailTemplateFields}],
    where: {
      id: req.id,
    },
    attributes: constants.mailTemplateFieldsForList,
    raw: true,
  }).then(function (result) {
    callback(null, result);
  }).catch(function (err) {
    callback(err, null);
  });
}

function getAllMailTemplates(req, getSystemMail,callback) {
  
  let query = {};  
  if (req.id) {
      query['$or'] = [{UserId: req.id}, {UserId: null}];
  }
  
  let include = [{ model: MailTemplateOriginal, attributes: ['id', 'name', 'systemMessage', 'category']}];
  
  if (!getSystemMail) {
    //getting list that any user can edit
    query.systemMessage = false;
  }
  
  MailTemplate.findAll({
      include: include,
      where: query,
      attributes: constants.mailTemplateFieldsForList,
      raw: true,
      order: "id ASC"
  }).then(function(result) {
      callback(null, result);
  }).catch(function(error) {
    callback(error);
  });
};

function copyBaseTemplates(callback) {
  MailTemplateOriginal.findAll({
      attributes: constants.originalMailTemplateFields,
      raw: true
  }).then(function(result) {
    for (var i = 0; i < result.length; i++) {
        result[i].MailTemplateBaseId = result[i].id;
        delete result[i]["id"];
    }
    MailTemplate.bulkCreate(result).done(function(res) {
       callback(null, res);
    }, function(err) {
       callback(err);
    })
  }).catch(function(error) {
    callback(error);
  });
}

function setMailTemplateDefault (id, templateCopyId, callback) {
  var params = {
    mailTemplateActive: templateCopyId
  }
  console.log("_", id, "; tId", templateCopyId);
  MailTemplateOriginal.update(params, {
      where: {id: id}
    })
  .then(function (result) {
    return callback(null, result);
  })
  .catch(function (err) {
    callback(err);
  });
}

function saveMailTemplate(template, createCopy, userId, callback) {
  if (!template) {
      return callback("e-mail template not provided");
  }
  var id = template.id;
  delete template["id"];

  if (!template["systemMessage"] && (!template["UserId"] || createCopy)) {
    if (!template["systemMessage"])
      template.UserId = userId;
    create(template, function(error, result) {
      if (!error) {
        setMailTemplateDefault(result.MailTemplateBaseId, result.id, callback);
      } else {
        callback(error);
      }  
    });
  } else {
    update(id, template, function(error, result) {
      if (!error) {
        setMailTemplateDefault(template.MailTemplateBaseId, id, callback);
      } else {
        callback(error);
      }  
    });
  }
}

function resetMailTemplate(templateId, callback) {
  if (!templateId) {
      return callback("e-mail template not provided");
  }
  
  getMailTemplateForReset({id: templateId}, function(err, result) {
    if (result) {
      update(templateId, {name: result["MailTemplateBase.name"], subject: result["MailTemplateBase.subject"], content: result["MailTemplateBase.content"]}, function(error, result) {
          callback(error, result);
      });
    } else {
      callback(err);
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
  str = str.replace(/\{Login\}/ig, "<%= logInUrl %>");
  
  return str;
}

function composePreviewMailTemplate(mailTemplate) {
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
  
  return composeMailFromTemplate(mailTemplate, mailPreviewVariables);
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
  sendMailFromTemplateWithCalendarEvent: sendMailFromTemplateWithCalendarEvent,
  composePreviewMailTemplate: composePreviewMailTemplate,
  mailTemplateType: mailTemplateType,
  getActiveMailTemplate: getActiveMailTemplate
}
