"use strict";

var MessagesUtil = require('./../util/messages');
var models = require('./../models');
var MailTemplate  = require('./../models').MailTemplate;
var SessionMailTemplate  = require('./../models').SessionMailTemplate;
var MailTemplateOriginal  = require('./../models').MailTemplateBase;
var Session  = require('./../models').Session;
var SessionMember  = require('./../models').SessionMember;
var AccountUser  = require('./../models').AccountUser;
var accountUserService  = require('./account');
var filters = require('./../models/filters');
var templateMailer = require('../mailers/mailTemplate');
var emailDate = require('./formats/emailDate');
var mailersHelpers = require('../mailers/helpers');
var _ = require('lodash');
var ejs = require('ejs');
var q = require('q');
var constants = require('../util/constants');
var momentTimeZone = require('moment-timezone');
var sessionBuilderSnapshotValidation = require('./sessionBuilderSnapshotValidation');
let Bluebird = require('bluebird');
let moment = require('moment');

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
  copyTemplatesFromSession: copyTemplatesFromSession,
  sendTestEmail: sendTestEmail
};

let templateHeaderListFields = ['id', 'name', 'category'];
let resourceIdPattern = /data-resource-id="(\d*)/g;

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

function createSessionMailTemplateRelation(sessionId, mailTemplateId, templateToReturn, transaction) {
  return new Bluebird((resolve, reject) => {
    if (sessionId) {
      SessionMailTemplate.create({ sessionId, mailTemplateId }, {transaction}).then(() => {
        resolve(templateToReturn);
      }, (error) => {
        reject(error);
      })
    } else {
      resolve(templateToReturn);
    }
  });
}

function create(params, sessionId, callback) {
  removeTemplatesFromSession(sessionId, params.MailTemplateBaseId, function() {
    let transactionPool = models.sequelize.transactionPool;
    let tiket = transactionPool.getTiket();
    transactionPool.once(tiket, () => {
      models.sequelize.transaction().then(function(transaction) {
        MailTemplate.create(params, { transaction }).then(function(res) {
          return createSessionMailTemplateRelation(sessionId, res.id, res, transaction);
        }).then(function(result) {
          setMailTemplateRelatedResources(result.id, result.content, transaction).then(function() {
            transaction.commit().then(function() {
              transactionPool.emit(transactionPool.CONSTANTS.endTransaction, tiket);
              callback(null, result);
            });
          }, function(error) {
            transaction.rollback().then(function() {
              transactionPool.emit(transactionPool.CONSTANTS.endTransaction, tiket);
              callback(filters.errors(error));
            });
          });
        }).catch(function(error) {
          transaction.rollback().then(function() {
            transactionPool.emit(transactionPool.CONSTANTS.endTransaction, tiket);
            if (error.name == 'SequelizeUniqueConstraintError') {
              callback({ name: MessagesUtil.mailTemplate.error.uniqueName });
            } else {
              transactionPool.emit(transactionPool.CONSTANTS.endTransaction, tiket);
              callback(filters.errors(error));
            }
          });
        });
      });
    })
    transactionPool.once(transactionPool.timeoutEvent(tiket), () => {
      callback("Server Timeoute");
    });

    transactionPool.emit(transactionPool.CONSTANTS.nextTick);
  });
}

function update(id, parameters, sessionId, callback) {
  removeTemplatesFromSession(sessionId, parameters['MailTemplateBase.id'], function() {
    models.sequelize.transaction().then(function(transaction) {
      MailTemplate.update(parameters, {
        where: {id: id},
        transaction
      }).then(function(res) {
        return createSessionMailTemplateRelation(sessionId, id, res, transaction);
      }).then(function(result) {
        setMailTemplateRelatedResources(id, parameters.content, transaction).then(function() {
          transaction.commit().then(function() {
            callback(null, result);
          });
        }, function(error) {
          transaction.rollback().then(function() {
            callback(filters.errors(error));
          });
        });
      }).catch(function(error) {
        transaction.rollback().then(function() {
          callback(filters.errors(error));
        });
      });
    });
  });
}

function setMailTemplateRelatedResources(mailTemplateId, mailTemplateContent, transaction) {
  return new Bluebird((resolve, reject) => {
    let matches = mailTemplateContent.match(resourceIdPattern);
    let ids = [];
    _.each(matches, (match) => {
      let id = parseInt(match.split('"')[1]);
      if (id) {
        ids.push(id);
      }
    });

    //remove old MailTemplateResources
    if (ids.length > 0) {
      models.MailTemplateResource.destroy({
        where: {
          mailTemplateId: mailTemplateId,
          resourceId: { $notIn: ids }
        },
        transaction: transaction
      });
    } else {
      models.MailTemplateResource.destroy({
        where: {
          mailTemplateId: mailTemplateId
        },
        transaction: transaction
      });
    }

    //add new MailTemplateResources
    models.Resource.findAll({
      attributes: ["id"],
      where: {
        id: { $in: ids },
      },
      include: [{
        model: models.MailTemplate,
        where: { id: mailTemplateId },
        attributes: ["id"],
        required: false
      }],
      transaction: transaction
    }).then(function(resources) {
      Bluebird.each(resources, (resource) => {
        return new Bluebird(function (resolve, reject) {
          if (resource.MailTemplates.length == 0) {
            models.MailTemplateResource.create({ mailTemplateId: mailTemplateId, resourceId: resource.id }, { transaction: transaction }).then(function(result) {
              resolve();
            }, function(error) {
              reject(error);
            });
          } else {
            resolve();
          }
        });
      }).then(function(result) {
        resolve();
      }, function(error) {
        reject(error);
      });
    });
  });
}

function getLatestMailTemplate(req, callback) {
  let accountQuery = { };
  let templateQuery = {	'$or': [{ id: req.latestId }, { MailTemplateBaseId: req.id }]	};
  let include = [{ model: MailTemplateOriginal, attributes: ['id', 'name'] }];

  if (req.accountId) {
   accountQuery['$or'] = [{ AccountId: req.accountId }, { AccountId: null }];
  } else {
    accountQuery.AccountId = null;
  }
  if (req.sessionId) {
    include.push({
      model: SessionMailTemplate,
      where: { sessionId: req.sessionId },
      required: true
    });
  }

  MailTemplate.findAll({
    include: include,
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
  let baseTemplateQuery = {category:{ $in: ["firstInvitation", "notThisTime", "notAtAll", "closeSession", "generic"] }};
  getAllMailTemplatesWithParameters(accountId, getNoAccountData, getSystemMail, baseTemplateQuery, fullData, callback, false, sessionId);
}

function getAllMailTemplates(accountId, getNoAccountData, getSystemMail, fullData, callback, isAdmin) {
  getAllMailTemplatesWithParameters(accountId, getNoAccountData, getSystemMail, null, false, callback, isAdmin, null);
}

function prepareCategoryQuery(baseTemplateQuery, isAdmin) {
  if (!baseTemplateQuery) {
    baseTemplateQuery = {};
  }

  if (!baseTemplateQuery.category) {
    baseTemplateQuery.category = {};
  }

  baseTemplateQuery.category.$not = isAdmin ? 'confirmation' : ['confirmation', 'accountManagerConfirmation'];
  return baseTemplateQuery;
}

function getAllMailTemplatesWithParameters(accountId, getNoAccountData, getSystemMail, baseTemplateQuery, fullData, callback, isAdmin, sessionId) {
  let query =  {};
  baseTemplateQuery = prepareCategoryQuery(baseTemplateQuery, isAdmin);

  let include = [{
    model: MailTemplateOriginal,
    attributes: ['id', 'name', 'systemMessage', 'category'],
    where: baseTemplateQuery
  }];

  if (sessionId) {
    include.push({
      model: Session,
      where: { id: { '$or': [sessionId, null] } },
      attributes: ['id', 'name'],
      required: false
    });
  }

  if (accountId && !getSystemMail) {
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
    initTemplatesSessionNames(result);
    sortMailTemplates(result);
    callback(null, result);
  }).catch(function(error) {
    callback(filters.errors(error));
  });
};

function initTemplatesSessionNames(templates) {
  _.each(templates, (template) => {
    if (template['Sessions.name']) {
      template.sessionName = template['Sessions.name'];
      template.sessionId = template['Sessions.id'];
    }
  });
}

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

function copyTemplatesFromSession(sessionIdFrom, sessionIdTo, callback) {
  SessionMailTemplate.findAll({ where: { sessionId: sessionIdFrom } }).then(function(result) {
    var dataToCopy = [];
    _.map(result, function(item, index) {
      dataToCopy.push({sessionId: sessionIdTo, mailTemplateId: item.mailTemplateId});
    });

    if (dataToCopy.length) {
      SessionMailTemplate.bulkCreate(dataToCopy).done(function(res) {
        callback(null, res);
      }, function(err) {
        callback(err);
      });
    } else {
      callback(null);
    }
  }, function(error) {
    callback(error);
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

function setMailTemplateDefault(id, templateCopyId, isAdmin, callback) {
  if (!isAdmin) {
    return callback(null, {id: templateCopyId});
  }
  var params = {
    mailTemplateActive: templateCopyId
  }
  MailTemplateOriginal.update(params, {
    where: {id: id}
  }).then(function (result) {
    return callback(null, {id: templateCopyId});
  }).catch(function (err) {
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

  if(template.properties) {
    if (template.properties.createdWithCustomName && template.properties.templateName == null) {
        template.name = null;
    }

    if (template.properties.templateName) {
      result = true;
    }
  }

  return (result || shouldOverwrite);
}

function variablesForTemplate(type) {
  switch (type) {
    case "firstInvitation":
      return ["{First Name}", "{Session Name}", "{Start Time}", "{End Time}", "{Start Date}", "{End Date}", "{Incentive}", "{Accept Invitation}", "{Host First Name}", "{Host Last Name}", "{Host Email}", "{Invitation Not This Time}", "{Invitation Not At All}"];
      break;
    case "closeSession":
      return ["{First Name}", "{Incentive}", "{Host First Name}", "{Host Last Name}", "{Host Email}", "{Close Session Yes In Future}", "{Close Session No In Future}"];
      break;
    case "confirmation":
      return ["{Incentive}", "{First Name}", "{Start Time}", "{Start Date}", "{Confirmation Check In}", "{Guest Email}", "{Host First Name}", "{Host Last Name}", "{Host Email}"];
      break;
    case "generic":
      return ["{First Name}", "{Host First Name}", "{Host Last Name}", "{Host Email}"];
      break;
    case "notAtAll":
      return ["{First Name}", "{Host First Name}", "{Host Last Name}", "{Host Email}"];
      break;
    case "notThisTime":
      return ["{First Name}", "{Host First Name}", "{Host Last Name}", "{Host Email}"];
      break;
    case "accountManagerConfirmation":
      return ["{First Name}", "{Login}", "{Last Name}"];
      break;
    default:
      return [];
  }
}

function isEndDateAfterStartDate(startTime, endTime) {
  var startDate = moment(startTime, 'YYYY-MM-DD').toDate();
  var endDate = moment(endTime, 'YYYY-MM-DD').toDate();

  return moment(endDate).isAfter(startDate);
}

function validateTemplate(template) {
  let deferred = q.defer();
  var params = variablesForTemplate(template['MailTemplateBase.category']);
  var error = null;

  if (template.properties && template.properties.sessionId) {
    Session.find({ where: { id: template.properties.sessionId } }).then(function (result) {
      let incentivePopulated = false;
      if (result && result.incentive_details) {
        incentivePopulated = true;
      }

      if (params.length) {
        _.map(params, function(variable) {
            if (template.content.indexOf(variable) == -1) {
              if ((incentivePopulated || variable != "{Incentive}") && !skipStartDate(result.startTime, result.endTime, variable)) {
                error = "Missing " + variable + " variable";
              }
            }
        });
      }
      if (error) {
        deferred.reject(error);
      } else {
        deferred.resolve();
      }

    }, function(error) {
      deferred.reject(MessagesUtil.session.notFound);
    });
  } else {
    if (params.length) {
      _.map(params, function(variable) {
        if (template.content.indexOf(variable) == -1) {
           error = "Missing " + variable + " variable";
           return;
        }
      });
    }
    if (error) {
      deferred.reject(error);
    } else {
      deferred.resolve();
    }
  }

  return deferred.promise;

  function skipStartDate(startTime, endTime, variableName) {
    return variableName == "{Start Date}" && !isEndDateAfterStartDate(startTime, endTime) ;
  }
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
    properties: inputTemplate.properties
  };

  id = inputTemplate.id;

  return {
    id: id,
    template: targetTemplate
  };
}

function removeTemplatesFromSession(sessionId, mailTemplateBaseId, callback){
  if (sessionId && mailTemplateBaseId) {
    MailTemplate.findAll({
      where: {
        isCopy: true,
        MailTemplateBaseId: mailTemplateBaseId
      }
    }).then(function(templates) {
      let ids = _.map(templates, 'id');
      SessionMailTemplate.destroy({ where: { sessionId: sessionId, mailTemplateId: ids } }).then(function (result) {
        return callback(null, result);
      }).catch(function (error) {
        callback(error);
      });
    }).catch(function(error) {
      callback(error);
    });
  } else {
    callback();
  }
}

function validateTemplateSnapshot(shouldCreateTemplateCopy, snapshot, templateObject, callback) {
  if (shouldCreateTemplateCopy) {
    callback();
  } else {
    MailTemplate.find({ where: {id: templateObject.id} }).then(function(originalTemplate) {
      let validationRes = sessionBuilderSnapshotValidation.isMailTemplateDataValid(snapshot, templateObject, originalTemplate);
      if (validationRes.isValid) {
        callback();
      } else {
        callback(null, { validation: validationRes });
      }
    }, function(error) {
      callback(filters.errors(error));
    });
  }
}

function saveMailTemplate(template, createCopy, accountId, isAdmin, sessionId, callback) {
  if (template) {
    validateTemplate(template).then(function() {

      let templateObject = buildTemplate(template);
      assignTemplateName(templateObject.template);
      let shouldCreateTemplateCopy = shouldCreateCopy(templateObject.template, createCopy, accountId);

      validateTemplateSnapshot(shouldCreateTemplateCopy, template.snapshot, templateObject, function(validationError, validationResult) {
        if (validationError) {
          callback(validationError);
        } else if (validationResult) {
          callback(null, validationResult);
        } else {
          removeTemplatesFromSession(createCopy && sessionId, template['MailTemplateBase.id'], function() {
            let isAdminDefault = isAdmin && template.properties && template.properties.sessionBuilder;
            if (shouldCreateTemplateCopy) {
              templateObject.template.isCopy = true;
              templateObject.template.AccountId = accountId;
              create(templateObject.template, sessionId, function(error, result) {
                if (error) {
                  callback(error);
                } else {
                  setMailTemplateDefault(result.MailTemplateBaseId, result.id, isAdminDefault, callback);
                }
              });
            } else {
              update(templateObject.id, templateObject.template, sessionId, function(error, result) {
                if (error) {
                  callback(error);
                } else {
                  setMailTemplateDefault(templateObject.template.MailTemplateBaseId, templateObject.id, isAdminDefault, callback);
                }
              });
            }
          });
        }
      });

    }, function(error) {
      callback(error);
    });
  } else {
    callback(MessagesUtil.mailTemplate.error.notProvided);
  }

  function assignTemplateName(template) {
    if (template.properties && template.properties.templateName) {
      template.name = template.properties.templateName;
    }
  }
}


function resetMailTemplate(templateId, baseTemplateId, isCopy, callback) {
  if (!templateId) {
      return callback(MessagesUtil.mailTemplate.error.notProvided);
  }

  getMailTemplateForReset({id: templateId, baseId:baseTemplateId}, function(err, result) {
    if (result) {
      if (isCopy) {
        update(templateId, {name: result.name, subject: result.subject, content: result.content}, null, function(error, result) {
          callback(error, result);
        });
      } else {
        update(templateId, {name: result["MailTemplateBase.name"], subject: result["MailTemplateBase.subject"], content: result["MailTemplateBase.content"]}, null, function(error, result) {
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
    termsOfUseUrl: constants.externalLinks.termsOfUse,
    privacyPolicyUrl: constants.externalLinks.privacyPolicy,
    termsOfUseGuestUrl: constants.externalLinks.termsOfUseGuest,
    privacyPolicyGuestUrl: constants.externalLinks.privacyPolicyGuest,
    systemRequirementsUrl: mailersHelpers.getUrl('', null, '/system_requirements'),
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
    if (params.removeTimeBlock) {
      template.content = removeTimeBlock(template.content);
    }
    template.content = formatTemplateString(template.content, params.orginalStartTime, params.orginalEndTime);
    template.subject = formatTemplateString(template.subject);
    template.content = ejs.render(template.content, params);
    template.subject = ejs.render(template.subject, params);

    return template;
  } catch (error) {
    return {error: error};
  }
}

function removeTimeBlock(content) {
  const blockStart = "<div class=timeInfoPanelTitle>";
  const blockEnd = "<div class=timeInfoPanelEnd>";

  let blockStartIndex = content.indexOf(blockStart);
  if (blockStartIndex >= 0) {
    let blockEndIndex = content.indexOf(blockEnd, blockStartIndex);
    if (blockEndIndex >= 0) {
      return content.substr(0, blockStartIndex) + content.substr(blockEndIndex + blockEnd.length);
    }
  }
  return content;
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

function sendTestEmail(mailTemplate, sessionId, accountUserId, callback) {
  AccountUser.find({
    where: { id: accountUserId },
  }).then(function(accountUser) {
    if (accountUser) {
      composePreviewMailTemplate(mailTemplate, sessionId, function(result) {
        if (result.error) {
          callback(result.error);
        } else {
          var params = {
            orginalStartTime: new Date(),
            orginalEndTime:  new Date(),
            email: accountUser.email
          };

          templateMailer.sendMailWithTemplateAndCalendarEvent(result, params, callback);
        }
      });
    } else {
      callback({ error: MessagesUtil.accountUser.notFound });
    }
  }, function(error) {
    callback(error);
  });
}


function prepareDefaultStyles(str) {
  let idx = str.indexOf('</style>');
  if (idx > -1) {
    let standardStyle = ".acceptButton a, .notThisTimeButton a, .notAtAllButton a {color: #ffffff !important;}";
    str = str.substr(0, idx) + standardStyle + str.substr(idx);
  }
  return str;
}

//replace all "In Editor" variables with .ejs compatible variables
function formatTemplateString(str, startDate, endDate) {
  if (startDate && endDate) {
    str = prepareFirstInvitationStartDateState(str, startDate, endDate);
  }
  str = prepareDefaultStyles(str);
  str = str.replace(/\{First Name\}/ig, "<%= firstName %>");
  str = str.replace(/\{Last Name\}/ig, "<%= lastName %>");
  str = str.replace(/\{Account Name\}/ig, "<%= accountName %>");
  str = str.replace(/\{Start Date\}/ig, "<%= startDate %>");
  str = str.replace(/\{Start Time\}/ig, "<%= startTime %>");
  str = str.replace(/\{End Date\}/ig, "<%= endDate %>");
  str = str.replace(/\{End Time\}/ig, "<%= endTime %>");
  str = str.replace(/\{Host First Name\}/ig, "<%= facilitatorFirstName %>");
  str = str.replace(/\{Facilitator First Name\}/ig, "<%= facilitatorFirstName %>");
  str = str.replace(/\{Host Last Name\}/ig, "<%= facilitatorLastName %>");
  str = str.replace(/\{Facilitator Last Name\}/ig, "<%= facilitatorLastName %>");
  str = str.replace(/\{Host Email\}/ig, "<%= facilitatorMail %>");
  str = str.replace(/\{Facilitator Email\}/ig, "<%= facilitatorMail %>");
  str = str.replace(/\{Guest Email\}/ig, "<%= participantMail %>");
  str = str.replace(/\{Participant Email\}/ig, "<%= participantMail %>");
  str = str.replace(/\{Guest First Name\}/ig, "<%= guestFirstName %>");
  str = str.replace(/\{Participant First Name\}/ig, "<%= firstName %>");
  str = str.replace(/\{Guest Last Name\}/ig, "<%= guestLastName %>");
  str = str.replace(/\{Participant Last Name\}/ig, "<%= lastName %>");
  str = str.replace(/\{Host Mobile\}/ig, "<%= facilitatorMobileNumber %>");
  str = str.replace(/\{Facilitator Mobile\}/ig, "<%= facilitatorMobileNumber %>");
  str = str.replace(/\{Session Name\}/ig, "<%= sessionName %>");
  str = str.replace(/\{Incentive\}/ig, "<%= incentive %>");
  str = str.replace(/\{Accept Invitation\}/ig, "<%= acceptInvitationUrl %>");
  str = str.replace(/\{Invitation Not This Time\}/ig, "<%= invitationNotThisTimeUrl %>");
  str = str.replace(/\{Invitation Not At All\}/ig, "<%= invitationNotAtAllUrl %>");
  str = str.replace(/\{Mail Unsubscribe\}/ig, "<%= unsubscribeMailUrl %>");
  str = str.replace(/\{Privacy Policy\}/ig, "<%= privacyPolicyUrl %>");
  str = str.replace(/\{Terms of Use\}/ig, "<%= termsOfUseUrl %>");
  str = str.replace(/\{Privacy Policy Guest\}/ig, "<%= privacyPolicyGuestUrl %>");
  str = str.replace(/\{Terms of Use Guest\}/ig, "<%= termsOfUseGuestUrl %>");
  str = str.replace(/\{Close Session Yes In Future\}/ig, "<%= participateInFutureUrl %>");
  str = str.replace(/\{Close Session No In Future\}/ig, "<%= dontParticipateInFutureUrl %>");
  str = str.replace(/\{Confirmation Check In\}/ig, "<%= confirmationCheckInUrl %>");
  str = str.replace(/\{Login\}/ig, "<%= logInUrl %>");
  str = str.replace(/\{Time Zone\}/ig, "<%= timeZone %>");
  str = str.replace(/\{Reset Password URL\}/ig, "<%= resetPasswordUrl %>");
  str = str.replace(/\{System Requirements\}/ig, "<%= systemRequirementsUrl %>");
  return str;
}

function prepareFirstInvitationStartDateState(str, startDate, endDate) {
  var visibleStartDate = "start-date-container\">";
  var hiddenStartDate = "start-date-container\" style=\"display:none\">";

  if (isEndDateAfterStartDate(startDate, endDate)) {
    return str.replace(hiddenStartDate, visibleStartDate);
  } else {
    return str.replace(visibleStartDate, hiddenStartDate);
  }
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
    resetPasswordUrl: "#/resetPasswordUrl",
    systemRequirementsUrl: "#/systemRequirementsdUrl",
    timeZone: ""
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
        let startTime = new Date(result.startTime);
        mailPreviewVariables.startDate = emailDate.format("date", startTime, result.timeZone);
        mailPreviewVariables.startTime = emailDate.format("time", new Date(result.startTime), result.timeZone);
        mailPreviewVariables.endDate = emailDate.format("date", new Date(result.endTime), result.timeZone);
        mailPreviewVariables.endTime = emailDate.format("time", new Date(result.endTime), result.timeZone);
        mailPreviewVariables.sessionName = result.name;
        mailPreviewVariables.timeZone = emailDate.format("timeZone", startTime, result.timeZone);
        mailPreviewVariables.incentive = result.incentive_details;
        if (result.SessionMembers[0]) {
          mailPreviewVariables.facilitatorFirstName = result.SessionMembers[0].AccountUser.firstName;
          mailPreviewVariables.facilitatorLastName = result.SessionMembers[0].AccountUser.lastName;
          mailPreviewVariables.facilitatorMail = result.SessionMembers[0].AccountUser.email;
          mailPreviewVariables.facilitatorMobileNumber = result.SessionMembers[0].AccountUser.mobile;
        }
      }

      processMailTemplate(mailTemplate, mailPreviewVariables, callback);
    });
  } else {
    processMailTemplate(mailTemplate, mailPreviewVariables, callback);
  }

  function processMailTemplate(mailTemplate, mailPreviewVariables, callback) {
    var result = composeMailFromTemplate(mailTemplate, mailPreviewVariables);

    if (result.error) {
      callback({ error: result.error });
    } else {
      result.content = result.content.replace(/<span style="color:red;">/ig, "<span style=\"display: none;\">");
      result.content = result.content.replace(/href="\{Calendar\}"/ig, "");
      callback(result);
    }
  }
}
