"use strict";

var MessagesUtil = require('./../util/messages');
var MailTemplate  = require('./../models').MailTemplate;
var MailTemplateOriginal  = require('./../models').MailTemplateBase;
var Session  = require('./../models').Session;
var SessionMember  = require('./../models').SessionMember;
var AccountUser  = require('./../models').AccountUser;
var filters = require('./../models/filters');
var templateMailer = require('../mailers/mailTemplate');
var emailDate = require('./formats/emailDate');
var mailersHelpers = require('../mailers/helpers');
var _ = require('lodash');
var ejs = require('ejs');
var constants = require('../util/constants');

module.exports = {
  validate: validate,
  create: create,
  update: update,
  getAllMailTemplates: getAllMailTemplates,
  getMailTemplate: getMailTemplate,
  saveMailTemplate: saveMailTemplate,
  getAllSessionMailTemplates: getAllSessionMailTemplates,
  createBaseMailTemplate: createBaseMailTemplate,
  copyBaseTemplates: copyBaseTemplates,
  deleteMailTemplate: deleteMailTemplate,
  resetMailTemplate: resetMailTemplate,
  composeMailFromTemplate: composeMailFromTemplate,
  sendMailFromTemplate: sendMailFromTemplate,
  sendMailFromTemplateWithCalendarEvent: sendMailFromTemplateWithCalendarEvent,
  composePreviewMailTemplate: composePreviewMailTemplate,
  getActiveMailTemplate: getActiveMailTemplate,
  getMailTemplateTypeList: getMailTemplateTypeList,
  copyTemplatesFromSession: copyTemplatesFromSession
};

var templateHeaderListFields = [
    'id', 'name', 'category'
];

function getMailTemplateTypeList(categories, callback) {
  let query = {category:{ $in: categories }};
  MailTemplateOriginal.findAll({
      attributes: templateHeaderListFields,
      raw: true,
      where: query
  }).then(function(templates) {
    callback(null, templates);
  }).catch(function(error) {
    callback(error);
  });
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
    callback(filters.errors(err));
  }).catch(function(err) {
    callback(filters.errors(err));
  });
}

function create(params, callback) {
  MailTemplate.create(params).then(function(result) {
    callback(null, result);
  }).catch(function(error) {
    callback(filters.errors(error));
  });
}

function update(id, parameters, callback){
  MailTemplate.update(parameters, {
      where: {id: id}
  }).then(function(result) {
    callback(null, result);
  }).catch(function(error) {
    callback(filters.errors(error));
  });
}

function getLatestMailTemplate(req, callback) {
  let accountQuery = {};
  if (req.accountId) {
    accountQuery['$or'] = [{AccountId: req.accountId}, {AccountId: null}];
  } else {
    accountQuery.AccountId = null;
  }
  if (req.sessionId) {
    accountQuery.sessionId = req.sessionId;
    delete accountQuery.AccountId;
  }

  let templateQuery = {
    '$or': [{id: req.latestId}, {MailTemplateBaseId: req.id}]
  };

  if (req.sessionId) {
    templateQuery['$and'] = {sessionId: req.sessionId};
  }

  MailTemplate.findAll({
    include: [{
      model: MailTemplateOriginal, attributes: ['id', 'name']
    }],
    where: [accountQuery, templateQuery],
    attributes: constants.mailTemplateFields,
    raw: true,
    order: [['updatedAt', 'DESC']],
    limit: 1
  }).then(function (result) {
    if (result && result.length) {
      callback(null, result[0]);
    } else {
      callback({error: MessagesUtil.mailTemplate.notFound});
    }
  }).catch(function (err) {
    callback(err);
  });
}


function getMailTemplate(req, callback) {
  let query = {id: req.id};
  if (req.accountId) {
    query['$or'] = [{AccountId: req.accountId}, {AccountId: null}];
  }

  MailTemplate.find({
    include: [{ model: MailTemplateOriginal, attributes: ['id', 'name']}],
    where: query,
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
 * @param accountId id of account who created template or null to get default one
 * @returns {error, resultMailTemplate} result mail template will be either a copy or original version

  for category reference -> constants.mailTemplateType[]
 */
function getActiveMailTemplate(category, params, callback) {
  if (!constants.mailTemplateType[category]) {
    return callback({error: MessagesUtil.mailTemplate.error.categoryNotFound});
  }
  //getting mail template original version by category name
  MailTemplateOriginal.find({
    where: {
      category: category
    },
    attributes: constants.originalMailTemplateFields,
    raw: true
  }).then(function (result) {
    let query = {id: result.id, latestId: result.mailTemplateActive};
    if (params) {
      if (params.accountId) query.accountId = params.accountId;
      if (params.sessionId) query.sessionId = params.sessionId;
    }
    //get reference to active mail template
    getLatestMailTemplate(query, function(err, template) {
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
    attributes: constants.mailTemplateFields,
    raw: true,
    where: {AccountId: null, MailTemplateBaseId: req.baseId}
  }).then(function (result) {
    callback(null, result);
  }).catch(function (err) {
    callback(err, null);
  });
}

function getAllSessionMailTemplates(accountId, getNoAccountData, sessionId, getSystemMail, fullData, callback) {
  let baseTemplateQuery = {category:{ $in: ["firstInvitation", "confirmation", "notThisTime", "notAtAll", "closeSession", "generic"] }};
  let templateQuery = {};
  if (sessionId) {
    templateQuery.sessionId = {'$or': [sessionId, null]};
  }
  getAllMailTemplatesWithParameters(accountId, getNoAccountData, getSystemMail, baseTemplateQuery, templateQuery, fullData, callback);
}

function getAllMailTemplates(accountId, getNoAccountData, getSystemMail, fullData, callback) {
  let templateQuery = {};
  getAllMailTemplatesWithParameters(accountId, getNoAccountData, getSystemMail, null, templateQuery, false, callback);
}

function getAllMailTemplatesWithParameters(accountId, getNoAccountData, getSystemMail, baseTemplateQuery, templateQuery, fullData, callback) {
  let query = templateQuery || {};

  let include = [{ model: MailTemplateOriginal, attributes: ['id', 'name', 'systemMessage', 'category'], where: baseTemplateQuery }];

  if(accountId && !getSystemMail){
    query['$or'] = [{AccountId: accountId}, {AccountId: null}];
  }

  if (!accountId) {
    query.AccountId = null;
  }
  if (!getSystemMail) {
    query.systemMessage = false;
  }

  let attributes = [];
  if (fullData) {
    attributes = constants.mailTemplateFields;
  } else {
    attributes = constants.mailTemplateFieldsForList;
  }

  MailTemplate.findAll({
      include: include,
      where: query,
      attributes: attributes,
      raw: true,
      order: "id ASC"
  }).then(function(result) {
    sortMailTemplates(result);
    callback(null, result);
  }).catch(function(error) {
    callback(error);
  });
};

function sortMailTemplates(result) {
  let templateOrder = {"firstInvitation": 1, "confirmation": 2, "notThisTime": 3, "notAtAll": 4, "closeSession": 5, "generic": 6};
  let priorityOrderCount = Object.keys(templateOrder).length;

  _.map(result, function(item) {
    if (!templateOrder[item['MailTemplateBase.category']]) {
      templateOrder[item['MailTemplateBase.category']] = priorityOrderCount + item['id'];
    }
  });

  result.sort(function(a, b) {
    if (!a.AccountId && !b.AccountId) {
      let aOrder = templateOrder[a['MailTemplateBase.category']];
      let bOrder = templateOrder[b['MailTemplateBase.category']];
      return aOrder - bOrder;
    } else if (!a.AccountId && b.AccountId) {
      return -1;
    } else if (a.AccountId && !b.AccountId) {
      return 1;
    } else {
      return 0;
    }
  });
}

function copyTemplatesFromSession(accountId, sessionIdFrom, sessionIdTo, callback) {
  getAllSessionMailTemplates(accountId, false, sessionIdFrom, false, true, function(error, result) {
    if (error) {
      return callback(error);
    }
    var dataToCopy = [];
    _.map(result, function(item, index) {
      if (item.AccountId) {
        item.sessionId = sessionIdTo;
        delete item.id;

        dataToCopy.push(item);
      }
    });

    if (dataToCopy.length) {
      MailTemplate.bulkCreate(dataToCopy).done(function(res) {
         callback(null, res);
      }, function(err) {
         callback(err);
      })
    } else {
      callback(null);
    }
  });
}

function copyBaseTemplates(callback) {
  MailTemplateOriginal.findAll({
    attributes: constants.originalMailTemplateFields,
    raw: true
  }).then(function(result) {
    for (var i = 0; i < result.length; i++) {
      result[i].MailTemplateBaseId = result[i].id;
      delete result[i].id;
    }
    MailTemplate.bulkCreate(result).done(function(res) {
       callback(null, res);
    }, function(error) {
      callback(filters.errors(error));
    })
  }).catch(function(error) {
    callback(error);
  });
}

function setMailTemplateDefault (id, templateCopyId, isAdmin, callback) {
  if (!isAdmin) {
    return callback(null, {id: templateCopyId});
  }
  var params = {
    mailTemplateActive: templateCopyId
  }
  MailTemplateOriginal.update(params, {
      where: {id: id}
    })
  .then(function (result) {
    return callback(null, {id: templateCopyId});
  })
  .catch(function (err) {
    callback(err);
  });
}

function canTemplateBeCopied(template, accountId) {
  return accountId && !template["systemMessage"] && (!template["AccountId"]);
}

function shouldCreateCopy(template, shouldOverwrite, accountId) {
  var result = false;
  if (canTemplateBeCopied(template, accountId)) {
    result = true;

    if (shouldOverwrite && template["isCopy"]) {
      result = false;
    }
  }

  // in case if template was modified in session builder
  if (template.properties && template.properties.sessionId) {
    if (template.sessionId != template.properties.sessionId) {
      result = true;
      template.sessionId = template.properties.sessionId;
    }
  }

  if(template.properties) {
    if (template.properties.createdWithCustomName && template.properties.templateName == null) {
        template.name = null;
    }

    if (template.properties.templateName) {
      result = true;
      template.name = template.name + " " + template.properties.templateName;
    }
  }

  return (result || shouldOverwrite);
}

function variablesForTemplate(type) {
  switch (type) {
    case "firstInvitation":
      return ["{First Name}", "{Session Name}", "{Start Time}", "{End Time}", "{Start Date}", "{End Date}", "{Incentive}", "{Accept Invitation}", "{Facilitator First Name}", "{Facilitator Last Name}", "{Facilitator Email}", "{Invitation Not This Time}", "{Invitation Not At All}"];
      break;
    case "closeSession":
      return ["{First Name}", "{Incentive}", "{Facilitator First Name}", "{Facilitator Last Name}", "{Facilitator Email}", "{Close Session Yes In Future}", "{Close Session No In Future}"];
      break;
    case "confirmation":
      return ["{First Name}", "{Start Time}", "{Start Date}", "{Confirmation Check In}", "{Participant Email}", "{Facilitator First Name}", "{Facilitator Last Name}", "{Facilitator Email}"];
      break;
    case "generic":
      return ["{First Name}", "{Facilitator First Name}", "{Facilitator Last Name}", "{Facilitator Email}"];
      break;
    case "notAtAll":
      return ["{First Name}", "{Facilitator First Name}", "{Facilitator Last Name}", "{Facilitator Email}"];
      break;
    case "notThisTime":
      return ["{First Name}", "{Facilitator First Name}", "{Facilitator Last Name}", "{Facilitator Email}"];
      break;
    case "accountManagerConfirmation":
      return ["{First Name}", "{Login}", "{Last Name}"];
      break;
    default:
      return [];
  }
}

function validateTemplate(template) {
  var params = variablesForTemplate(template['MailTemplateBase.category']);
  var error = null;
  if (params.length) {
    _.map(params, function(variable) {
        if (template.content.indexOf(variable) == -1){
          error = "Missing " + variable + " variable";
        }
    });
  }

  return error;
}

function getMailTemplateForSession(req, callback) {
  if (!req.template.properties || !req.template.properties.sessionId) {
    return callback(req.template);
  }

  let baseTemplateQuery = {id: req.template['MailTemplateBase.id']};
  let include = [{ model: MailTemplateOriginal, attributes: ['id', 'name', 'systemMessage', 'category'], where: baseTemplateQuery }];

  MailTemplate.findAll({
    where: {
      sessionId: req.template.properties.sessionId,
      isCopy: true,
      required: true
    },
    include: include})
    .then(function(templates) {
      callback(null, templates)
    }).catch(function(error) {
      callback(error);
    });
}

function buildTemplate(inputTemplate) {
  let id = null;
  let targetTemplate = {
    name: inputTemplate.name,
    subject: inputTemplate.subject,
    content: inputTemplate.content,
    systemMessage: inputTemplate.systemMessage,
    required: (inputTemplate.required==null||inputTemplate.required==undefined)?true:false,
    isCopy: inputTemplate.isCopy,
    MailTemplateBaseId: inputTemplate.MailTemplateBaseId,
    AccountId: inputTemplate.AccountId,
    'MailTemplateBase.id': inputTemplate['MailTemplateBase.id'],
    'MailTemplateBase.name': inputTemplate['MailTemplateBase.name'],
    'MailTemplateBase.systemMessage': inputTemplate['MailTemplateBase.systemMessage'],
    'MailTemplateBase.category': inputTemplate['MailTemplateBase.category'],
    sessionId: inputTemplate.sessionId,
    properties: inputTemplate.properties
  };

  id = inputTemplate.id;

  return {
    id: id,
    template: targetTemplate
  };
}

function removeTemplatesFromSession(ids, callback){
  if (ids && ids.length > 0) {
    let parameters = {sessionId: null};
    MailTemplate.update(parameters, {
      where: { id: {$in: ids} }
    })
    .then(function (result) {
      return callback(null, result);
    })
    .catch(function (err) {
      callback(err);
    });
  } else {
    callback();
  }
}

function saveMailTemplate(template, createCopy, accountId, callback) {
  if (template) {
    let validationResult = validateTemplate(template);
    if (validationResult) {
      callback(validationResult);
      return;
    }

    let templateObject = buildTemplate(template);

    getMailTemplateForSession({template:template, accountId: accountId}, function(error, result) {
      let ids = [];
      if (!createCopy && result && result.id != templateObject.id) {
        ids = _.map(result, 'id');
      }

      removeTemplatesFromSession(ids, function() {
        if (shouldCreateCopy(templateObject.template, createCopy, accountId)) {
          templateObject.template.isCopy = true;
          templateObject.template.AccountId = accountId;
          if (createCopy) {
            templateObject.template.sessionId = null;
          }

          create(templateObject.template, function(error, result) {
            if (error) {
              callback(error);
            } else {
              setMailTemplateDefault(result.MailTemplateBaseId, result.id, !createCopy, callback);
            }
          });

        } else {
          update(templateObject.id, templateObject.template, function(error, result) {
            if (error) {
              callback(error);
            } else {
              setMailTemplateDefault(templateObject.template.MailTemplateBaseId, templateObject.id, !createCopy, callback);
            }
          });
        }
      });//removeTemplatesFromSession
    });//getMailTemplateForSession
  } else {
    callback(MessagesUtil.mailTemplate.error.notProvided);
  }
}


function resetMailTemplate(templateId, baseTemplateId, isCopy, callback) {
  if (!templateId) {
      return callback(MessagesUtil.mailTemplate.error.notProvided);
  }

  getMailTemplateForReset({id: templateId, baseId:baseTemplateId}, function(err, result) {
    if (result) {
      if (isCopy) {
        update(templateId, {name: result.name, subject: result.subject, content: result.content}, function(error, result) {
          callback(error, result);
        });
      } else {
        update(templateId, {name: result["MailTemplateBase.name"], subject: result["MailTemplateBase.subject"], content: result["MailTemplateBase.content"]}, function(error, result) {
          callback(error, result);
        });
      }
    } else {
      callback(err);
    }
  });
}

function deleteMailTemplate(id, callback) {
  if (!id) {
    return callback(MessagesUtil.mailTemplate.error.notProvided);
  }
  MailTemplate.destroy({ where: { id: id, $not: [{id: null}] } }).then(function() {
    callback(null, {});
  }).catch(function(error) {
    callback(error);
  });
}

function prepareMailDefaultParameters(params) {
  params = params || {};
  let defaultParams = {
    termsOfUseUrl: mailersHelpers.getUrl('', null, '/terms_of_use'),
    privacyPolicyUrl: mailersHelpers.getUrl('', null, '/privacy_policy'),
    firstName: "", lastName: "", accountName: "", startDate: new Date().toLocaleDateString(), startTime: new Date().toLocaleTimeString(),
    endDate: new Date().toLocaleDateString(), endTime: new Date().toLocaleTimeString(),
    facilitatorFirstName: "", facilitatorLastName: "", facilitatorMail: "", participantMail: "", facilitatorMobileNumber: "",
    sessionName: "", incentive: "", acceptInvitationUrl: "", invitationNotThisTimeUrl: "", invitationNotAtAllUrl: "", unsubscribeMailUrl: "", participateInFutureUrl: "",
    dontParticipateInFutureUrl: "", confirmationCheckInUrl: "", logInUrl: "", resetPasswordUrl: ""
  };
  _.extend(defaultParams, params);
  return defaultParams;
}
//replace templates "In Editor" variables with .ejs compatible variables
//in HTML content and subject
function composeMailFromTemplate(template, params) {
  params = prepareMailDefaultParameters(params);
  try {
    template.content = formatTemplateString(template.content);
    template.subject = formatTemplateString(template.subject);
    template.content = ejs.render(template.content, params);
    template.subject = ejs.render(template.subject, params);

    return template;
  } catch (error) {
    return {error: error};
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
  str = str.replace(/\{Participant First Name\}/ig, "<%= participantFirstName %>");
  str = str.replace(/\{Participant Last Name\}/ig, "<%= participantLastName %>");
  str = str.replace(/\{Facilitator Mobile\}/ig, "<%= facilitatorMobileNumber %>");
  str = str.replace(/\{Session Name\}/ig, "<%= sessionName %>");
  str = str.replace(/\{Incentive\}/ig, "<%= incentive %>");
  str = str.replace(/\{Accept Invitation\}/ig, "<%= acceptInvitationUrl %>");
  str = str.replace(/\{Invitation Not This Time\}/ig, "<%= invitationNotThisTimeUrl %>");

  str = str.replace(/\{Invitation Not At All\}/ig, "<%= invitationNotAtAllUrl %>");
  str = str.replace(/\{Mail Unsubscribe\}/ig, "<%= unsubscribeMailUrl %>");
  str = str.replace(/\{Privacy Policy\}/ig, "<%= privacyPolicyUrl %>");
  str = str.replace(/\{Terms of Use\}/ig, "<%= termsOfUseUrl %>");
  str = str.replace(/\{Close Session Yes In Future\}/ig, "<%= participateInFutureUrl %>");
  str = str.replace(/\{Close Session No In Future\}/ig, "<%= dontParticipateInFutureUrl %>");
  str = str.replace(/\{Confirmation Check In\}/ig, "<%= confirmationCheckInUrl %>");
  str = str.replace(/\{Login\}/ig, "<%= logInUrl %>");
  str = str.replace(/\{Reset Password URL\}/ig, "<%= resetPasswordUrl %>");
  return str;
}

function composePreviewMailTemplate(mailTemplate, sessionId, callback) {
  let mailPreviewVariables = {
    firstName: "John",
    lastName: "Smith",
    accountName: "peter",
    startDate: emailDate.format("date", new Date(), 'Europe/London'),
    startTime: emailDate.format("time", new Date(), 'Europe/London'),
    endDate: emailDate.format("date", new Date(), 'Europe/London'),
    endTime: emailDate.format("time", new Date(), 'Europe/London'),
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
    resetPasswordUrl: "#/resetPasswordUrl"
  };
  if (sessionId) {
    Session.find({
        where: { id: sessionId },
        include: [{
          model: SessionMember,
          where: { role: "facilitator"},
          include: [{
            model: AccountUser
          }]
        }]
       }).then(function (result) {
      if (result) {
        mailPreviewVariables.startDate = emailDate.format("date", new Date(result.startTime), result.timeZone);
        mailPreviewVariables.startTime = emailDate.format("time", new Date(result.startTime), result.timeZone);
        mailPreviewVariables.endDate = emailDate.format("date", new Date(result.endTime), result.timeZone);
        mailPreviewVariables.endTime = emailDate.format("time", new Date(result.endTime), result.timeZone);
        mailPreviewVariables.sessionName = result.name;
        mailPreviewVariables.incentive = result.incentive_details;
        if (result.SessionMembers[0]) {
          mailPreviewVariables.facilitatorFirstName = result.SessionMembers[0].AccountUser.firstName;
          mailPreviewVariables.facilitatorLastName = result.SessionMembers[0].AccountUser.lastName;
          mailPreviewVariables.facilitatorMail = result.SessionMembers[0].AccountUser.email;
          mailPreviewVariables.facilitatorMobileNumber = result.SessionMembers[0].AccountUser.mobile;
        }
      }
      var template = composeMailFromTemplate(mailTemplate, mailPreviewVariables);
      template.content = template.content.replace(/<span style="color:red;">/ig, "<span style=\"display: none;\">");
      callback(template);
    });
  } else {
    var template = composeMailFromTemplate(mailTemplate, mailPreviewVariables);
    template.content = template.content.replace(/<span style="color:red;">/ig, "<span style=\"display: none;\">");
    callback(template);
  }
}
