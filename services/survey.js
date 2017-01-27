'use strict';

var models = require('./../models');
var filters = require('./../models/filters');
var Survey = models.Survey;
var SurveyQuestion = models.SurveyQuestion;
var SurveyAnswer = models.SurveyAnswer;
var ContactList = models.ContactList;
var validators = require('./../services/validators');
var contactListUserServices = require('./../services/contactListUser');
var contactListServices = require('./../services/contactList');
var MessagesUtil = require('./../util/messages');
var StringHelpers = require('./../util/stringHelpers');

var async = require('async');
var q = require('q');
var _ = require('lodash');
var Bluebird = require('bluebird');
var surveyConstants = require('../util/surveyConstants');

const VALID_ATTRIBUTES = {
  manage: [
    'accountId',
    'resourceId',
    'confirmedAt',
    'name',
    'closed',
    'closedAt',
    'description',
    'thanks',
    'SurveyQuestions'
  ],
  survey: [
    'id',
    'accountId',
    'resourceId',
    'name',
    'description',
    'thanks',
    'closed',
    'confirmedAt',
    'closedAt',
    'url'
  ],
  question: [
    'id',
    'surveyId',
    'resourceId',
    'name',
    'type',
    'question',
    'order',
    'answers',
    'required'
  ]
}

const SMALL_AGE = 'Under 18';

const CONTACT_DETAILS_STATS_FIELDS = ['gender', 'age'];

function simpleParams(data, message) {
  return { data: data, message: message };
};

// Exports
function findAllSurveys(account) {
  let deferred = q.defer();

  Survey.findAll({
    where: { accountId: account.id },
    attributes: VALID_ATTRIBUTES.survey,
    order: [
      ['id', 'asc'],
      [SurveyQuestion, 'order', 'ASC']
    ],
    include: [{
      model: SurveyQuestion,
      attributes: VALID_ATTRIBUTES.question,
    }]
  }).then(function(surveys) {
    deferred.resolve(simpleParams(surveys));
  }).catch(Survey.sequelize.ValidationError, function(error) {
    deferred.reject(filters.errors(error));
  }).catch(function(error) {
    deferred.reject(error);
  });

  return deferred.promise;
};

function findSurvey(params, skipValidations) {
  let deferred = q.defer();

  Survey.find({
    where: { id: params.id },
    attributes: VALID_ATTRIBUTES.survey,
    include: [{
        model: SurveyQuestion,
        attributes: VALID_ATTRIBUTES.question
      }
    ],
    order: [
      [SurveyQuestion, 'order', 'ASC']
    ]
  }).then(function(survey) {
    if(survey) {
      if(skipValidations) {
        deferred.resolve(simpleParams(survey));
      }
      else {
        if(survey.closed) {
          deferred.reject(MessagesUtil.survey.alreadyClosed);
        }
        else if(!survey.confirmedAt) {
          deferred.reject(MessagesUtil.survey.notConfirmed);
        }
        else {
          deferred.resolve(simpleParams(survey));
        }
      }
    }
    else {
      deferred.reject(MessagesUtil.survey.notFound);
    }
  }).catch(Survey.sequelize.ValidationError, function(error) {
    deferred.reject(filters.errors(error));
  }).catch(function(error) {
    deferred.reject(error);
  });

  return deferred.promise;
};

function removeSurvey(params, account) {
  let deferred = q.defer();

  Survey.find({ where: { id: params.id, accountId: account.id } }).then(function(survey) {
    if(survey) {
      var validCloseDate = new Date();
      validCloseDate.setDate(validCloseDate.getDate() - 1);

      if (survey.closed && (new Date(survey.closedAt) <= validCloseDate) || !survey.confirmedAt) {
        Survey.destroy({ where: { id: params.id, accountId: account.id } }).then(function(result) {
          if(result > 0) {
            deferred.resolve(simpleParams(null, MessagesUtil.survey.removed));
          } else {
            deferred.reject(MessagesUtil.survey.notFound);
          }
        }).catch(Survey.sequelize.ValidationError, function(error) {
          deferred.reject(filters.errors(error));
        }).catch(function(error) {
          deferred.reject(error);
        });
      } else {
        deferred.reject(MessagesUtil.survey.cantDelete);
      }

    } else {
      deferred.reject(MessagesUtil.survey.notFound);
    }
  }).catch(function(error) {
    deferred.reject(MessagesUtil.survey.notFound);
  });

  return deferred.promise;
};

function updateContactList(contactList, survey, fields, t){
  return new Bluebird((resolve, reject) => {
    fillCustomFields(fields, contactList);
    contactList.customFields = _.uniq(contactList.customFields);
    contactList.name = survey.name;

    contactList.save({ transaction: t }).then(function(contactList) {
      resolve(contactList);
    }).catch(ContactList.sequelize.ValidationError, function(error) {
      reject(filters.errors(error));
    }).catch(function(error) {
      reject(error);
    });
  })
}
function createContactList(survey, fields, t){
  return new Bluebird((resolve, reject) => {
    let contactList = ContactList.build({
        name: survey.name,
        accountId: survey.accountId,
        editable: true,
      }, { transaction: t });

      fillCustomFields(fields, contactList);
      contactListServices.create(contactList.dataValues, t).then((contactList) => {
        survey.update({contactListId: contactList.id}, {transaction: t}).then(() => {
          resolve(contactList);
        }, (error) => {
          reject(filters.errors(error));
        })
      }, (error) => {
        reject(filters.errors(error))
      });
  })
}


function tryFindCOntactList(survey, t) {
   survey.getContactList({ transaction: t }).then((contactList) => {
     
   })
}

function createOrUpdateContactList(survey, fields, t) {
   return new Bluebird((resolve, reject) => {
      survey.getContactList({ transaction: t }).then((contactList) => {
        if(contactList){
          resolve(updateContactList(contactList, survey, fields, t));
        }else{
          resolve(createContactList(survey, fields, t));
        }
      }, (error) => {
        reject(error);
      })
   })
}

function fillCustomFields(fields, contactList) {
  _.map(fields, function(value) {
    if(!_.includes(contactList.defaultFields, value)) {
      contactList.customFields.push(value);
    }
  });
}

function getContactListFields(questions) {
  let array = [];
  _.map(questions, function(question) {
    _.map(question.answers, function(answer) {
      if(answer.contactDetails) {
        array = _.map(answer.contactDetails, 'model');
      }
    });
  });

  return array;
}

function createSurveyWithQuestions(params, account) {
  let deferred = q.defer();

  validators.hasValidSubscription(account.id).then(function() {
      let validParams = validateParams(params, VALID_ATTRIBUTES.manage);
      validParams.accountId = account.id;

      models.sequelize.transaction(function (t) {
        return Survey.create(validParams, { include: [ SurveyQuestion ], transaction: t }).then(function(survey) {
          let fields = getContactListFields(survey.SurveyQuestions);

          return createOrUpdateContactList(survey, fields, t).then(function(contactList) {
            return survey;
          }, function(error) {
            throw error;
          });

        });
      }).then(function(survey) {
        survey.update({ url: validUrl(survey) }).then(function(survey) {
          deferred.resolve(simpleParams(survey, MessagesUtil.survey.created));
        });
      }).catch(Survey.sequelize.ValidationError, function(error) {
        deferred.reject(filters.errors(error));
      }).catch(function(error) {
        deferred.reject(error);
      });
  }, function(error) {
    deferred.reject(error);
  })

  return deferred.promise;
};

function updateSurvey(params, account) {
  let deferred = q.defer();
  let validParams = validateParams(params, VALID_ATTRIBUTES.manage);

  validators.hasValidSubscription(account.id).then(function() {
    models.sequelize.transaction(function (t) {
      return Survey.update(validParams, {
        where: { id: params.id, accountId: account.id },
        include: [ SurveyQuestion ],
        returning: true,
        transaction: t
      }).then(function(result) {
        if(result[0] == 0) {
          throw MessagesUtil.survey.notFound;
        } else {
          let survey = result[1][0];
          let ids = getIds(validParams.SurveyQuestions);
          let where = ids.length > 0 ? { surveyId: survey.id, id: { $notIn: ids } } : { surveyId: survey.id };
          return SurveyQuestion.destroy({
            where: where,
            transaction: t
          }).then(function() {
            return bulkUpdateQuestions(survey.id, validParams.SurveyQuestions, t).then(() => {
              let fields = getContactListFields(survey.SurveyQuestions);
              return createOrUpdateContactList(survey, fields, t).then(() => {
                return survey;
              })
            }, function() {
              t.rollback();
              return survey;
            });
          });
        }
      });
    }).then(function(survey) {
      deferred.resolve(simpleParams(survey, MessagesUtil.survey.updated));
    }).catch(Survey.sequelize.ValidationError, function(error) {
      deferred.reject(filters.errors(error));
    }).catch(function(error) {
      deferred.reject(error);
    });
  }, function(error) {
    deferred.reject(error);
  })

  return deferred.promise;
};


function updateSurveyStatus(params, account, deferred) {
  Survey.update({ closed: params.closed, closedAt: params.closed? null: new Date()}, {
    where: { id: params.id, accountId: account.id },
    returning: true
  }).then(function(result) {
    if(result[0] == 0) {
      deferred.reject(MessagesUtil.survey.notFound);
    }
    else {
      let survey = result[1][0];
      deferred.resolve(simpleParams(survey, survey.closed ? MessagesUtil.survey.closed : MessagesUtil.survey.opened));
    }
  }).catch(Survey.sequelize.ValidationError, function(error) {
    deferred.reject(filters.errors(error));
  }).catch(function(error) {
    deferred.reject(error);
  });
}

function changeStatus(params, account) {
  let deferred = q.defer();
  validators.hasValidSubscription(account.id).then(function() {
    if (params.closed) {
      updateSurveyStatus(params, account, deferred);
    } else {
      validators.subscription(account.id, 'survey', 1).then(function() {
        updateSurveyStatus(params, account, deferred);
      }, function(error) {
        deferred.reject(error);
      });
    }
  }, function(error) {
    deferred.reject(error);
  });

  return deferred.promise;
};

function copySurvey(params, account) {
  let deferred = q.defer();
  validators.hasValidSubscription(account.id).then(function() {
    Survey.find({
      where: { id: params.id, accountId: account.id },
      attributes: ['accountId', 'name', 'description', 'thanks', 'resourceId'],
      include: [{
          model: SurveyQuestion,
          attributes: ['name', 'question', 'order', 'answers', 'type', 'resourceId'],
        }
      ]
    }).then(function(survey) {
      if(survey) {
        survey.name = "Copy of " + survey.name
        createSurveyWithQuestions(survey, account).then(function(result) {
          findSurvey(result.data, true).then(function(result) {
            deferred.resolve(simpleParams(result.data, MessagesUtil.survey.copied));
          }, function(error) {
            deferred.reject(error);
          });
        }, function(error) {
          deferred.reject(error);
        });
      }
      else {
        deferred.reject(MessagesUtil.survey.notFound);
      }
    }).catch(Survey.sequelize.ValidationError, function(error) {
      deferred.reject(filters.errors(error));
    }).catch(function(error) {
      deferred.reject(error);
    });
  }, function(error) {
    deferred.reject(error);
  })

  return deferred.promise;
};

function answerSurvey(params) {
  let deferred = q.defer();

  let validParams = validAnswerParams(params);

  models.sequelize.transaction(function (t) {
    return Survey.find({ where: { id: validParams.surveyId }, include: [SurveyQuestion] }).then(function(survey) {
      return SurveyAnswer.create(validParams, { transaction: t }).then(function() {
        let fields = getContactListFields(survey.SurveyQuestions);
         survey.getContactList({ transaction: t }).then((contactList) => {
           updateContactList(contactList, survey, fields, t).then((contactList) => {
              if(!_.isEmpty(fields)) {
                let clParams = findContactListAnswers(contactList, validParams.answers);
                if(clParams && clParams != null && clParams.customFields.age != SMALL_AGE) {
                  clParams.contactListId = contactList.id;
                  clParams.accountId = survey.accountId;

                  return contactListUserServices.create(clParams).then(function(result) {
                    return survey;
                  }, function(error) {
                    throw error;
                  });
                } else {
                  return survey;
                }
              } else {
                return survey;
              }
           }, (error) => {
             throw error;
           })
         }, (error) => {
          throw error;
        });
      });
    })
  }).then(function(survey) {
    deferred.resolve(simpleParams(null, MessagesUtil.survey.completed));
  }).catch(SurveyAnswer.sequelize.ValidationError, function(error) {
    deferred.reject(filters.errors(error));
  }).catch(function(error) {
    deferred.reject(error);
  });

  return deferred.promise;
};

function findContactListAnswers(contactList, answers) {
  let values;
  _.map(answers, function(object, key) {
    if(object.contactDetails && object.tagHandled == true) {
      values = object.contactDetails;
    }
  });

  if(values) {
    let params = { customFields:[], defaultFields:[] };
    let object = {};
    _.map(contactList.customFields, function(field) {
      if(values[field]) {
        object[field] = values[field];
      }
    });
    params.customFields = object;

    object = {};
    _.map(contactList.defaultFields, function(field) {
      if(values[field]) {
        object[field] = values[field];
      }
    });
    params.defaultFields = object;

    return params;
  } else {
    return null;
  }
}

function confirmSurvey(params, account) {
  let deferred = q.defer();

  validators.subscription(account.id, 'survey', 1).then(function() {
    Survey.update({ confirmedAt: new Date() }, {
      where: { id: params.id, accountId: account.id },
      returning: true
    }).then(function(result) {
      if(result[0] == 0) {
        deferred.reject(MessagesUtil.survey.notFound);
      }
      else {
        let survey = result[1][0];
        deferred.resolve(simpleParams(survey, MessagesUtil.survey.confirmed));
      }
    }).catch(Survey.sequelize.ValidationError, function(error) {
      deferred.reject(filters.errors(error));
    }).catch(function(error) {
      deferred.reject(error);
    });
  }, function(error) {
    deferred.reject(error);
  });

  return deferred.promise;
};

function getSurveyData(id, accountId) {
  return new Bluebird(function (resolve, reject) {
    Survey.find({
      where: { id: id, accountId: accountId },
      attributes: ['id', 'name'],
      include: [{
        model: SurveyQuestion,
        attributes: VALID_ATTRIBUTES.question
      }, SurveyAnswer],
      order: [
        [SurveyQuestion, 'order', 'ASC']
      ]
    }).then(function(survey) {
      if(survey) {
        resolve(survey);
      } else {
        reject(MessagesUtil.survey.notFound);
      }
    }, function(error) {
      reject(filters.errors(error));
    });
  });
}

function exportSurvey(params, account) {
  return new Bluebird(function (resolve, reject) {
    canExportSurveyData(account).then(function() {
      getSurveyData(params.id, account.id).then(function(survey) {
        let header = createCsvHeader(survey.SurveyQuestions);
        let data = createCsvData(header, survey);
        resolve(simpleParams({ header: header, data: data }));
      }, function(error) {
        reject(error);
      });
    }, function(error) {
      reject(error);
    });
  });
};

function getSurveyStats(id, account) {
  return new Bluebird(function (resolve, reject) {
    canExportSurveyStats(account).then(function() {
      getSurveyData(id, account.id).then(function(survey) {
        let stats = createStats(survey); 
        resolve(simpleParams(stats));
      }, function(error) {
        reject(error);
      });
    }, function(error) {
      reject(error);
    });
  });
}

function canExportSurveyStats(account) {
  return new Bluebird(function (resolve, reject) {
    validators.planAllowsToDoIt(account.id, 'exportRecruiterStats').then(function() {
      resolve({});
    }, function(error) {
      reject(error);
    });
  });
}

function canExportSurveyData(account) {
  let deferred = q.defer();
  validators.planAllowsToDoIt(account.id, 'exportRecruiterSurveyData').then(function() {
    deferred.resolve({});
  }, function(error) {
    deferred.reject(error);
  });

  return deferred.promise;
}

function constantsSurvey() {
  let deferred = q.defer();

  if(surveyConstants) {
    deferred.resolve(simpleParams(surveyConstants));
  }
  else {
    deferred.reject(MessagesUtil.survey.noConstants);
  }

  return deferred.promise;
};

// Helpers
function createCsvHeader(questions) {
  let array = [];
  questions.forEach(function(question) {
    if(question.answers[0].contactDetails) {
      _.map(question.answers[0].contactDetails, function(contact) {
        array.push(contact.name);
      });
    } else {
      array.push(question.name);
    }
  });

  return array;
};

function createCsvData(header, survey) {
  let array = [];

  survey.SurveyAnswers.forEach(function(surveyAnswer) {
    let object = {};
    let indexDiff = 0;

    survey.SurveyQuestions.forEach(function(question, index) {
      let answer = surveyAnswer.answers[question.id];

      switch(answer.type) {
        case 'number':
          assignNumber(index + indexDiff, header, object, question, answer);
          break;
        case 'string':
          object[header[index + indexDiff]] = answer.value;
          break;
        case 'object':
          if (answer.contactDetails) {
            for(var property in answer.contactDetails) {
              while (property.toLowerCase() != header[index + indexDiff].replace(' ', '').toLowerCase()) {
                indexDiff++;
              }
              object[header[index + indexDiff]] = answer.contactDetails[property];
            }
          }
          break;
      }
    });

    array.push(object);
  });

  return array;
};

function assignNumber(index, header, object, question, answer) {
  question.answers.forEach(function(questionAnswer) {
    if(questionAnswer.order == answer.value) {
      object[header[index]] = questionAnswer.name;
    }
  });
};

function validAnswerParams(params) {
  let surveyAnswer = { surveyId: params.surveyId, answers: {} };
  for(let i in params.SurveyQuestions) {
    let question = params.SurveyQuestions[i];
    if(!surveyAnswer.answers[i]) {
      surveyAnswer.answers[i] = {};
    }

    if(question.contactDetails) {
      surveyAnswer.answers[i].type = typeof question.contactDetails;
      surveyAnswer.answers[i].value = null;
      surveyAnswer.answers[i].contactDetails = question.contactDetails;
    }
    else if(question.answer || question.answer == 0) {
      surveyAnswer.answers[i].type = typeof question.answer;
      surveyAnswer.answers[i].value = question.answer;
    }
    if (question.tagHandled == true) {
      surveyAnswer.answers[i].tagHandled = true;
    }
  }

  return surveyAnswer;
}

function bulkUpdateQuestions(surveyId, questions, t) {
  let deferred = q.defer();

  questions.forEach(function(question, index, array) {
    if(question.id && question.surveyId) {
      SurveyQuestion.update(question, {
        where: {
          surveyId: question.surveyId,
          id: question.id
        },
        transaction: t
      }).then(function(results) {
        if(index == array.length - 1) {
          deferred.resolve(true);
        }
      }).catch(SurveyQuestion.sequelize.ValidationError, function(error) {
        deferred.reject(filters.errors(error));
      }).catch(function(error) {
        deferred.reject(error);
      });
    }
    else {
      question.surveyId = surveyId;
      SurveyQuestion.create(question).then(function() {
        deferred.resolve(true);
      }).catch(SurveyQuestion.sequelize.ValidationError, function(error) {
        deferred.reject(filters.errors(error));
      }).catch(function(error) {
        deferred.reject(error);
      });
    }
  });

  return deferred.promise;
}

function createStats(survey) {
  let res = {
    survey: {
      name: survey.name,
      id: survey.id,
      answers: survey.SurveyAnswers.length
    },
    questions: { }
  };
  
  survey.SurveyQuestions.forEach(function(surveyQuestion) {
    populateStatsWithQuestionIfNotExists(res.questions, surveyQuestion, surveyQuestion.answers[0].contactDetails);

    surveyQuestion.answers.forEach(function(answer) {
      if (!_.isEmpty(answer)) {
        populateStatsWithAnswerIfNotExists(res.questions, surveyQuestion, answer);
      }
    });

    survey.SurveyAnswers.forEach(function(surveyAnswer) {
      let answer = surveyAnswer.answers[surveyQuestion.id];

      switch(answer.type) {
        case 'number':
          res.questions[surveyQuestion.id].answers[answer.value].count++;
          break;
        case 'string':
          res.questions[surveyQuestion.id].values.push(answer.value);
          break;
        case 'object':
          if (answer.contactDetails) {
            CONTACT_DETAILS_STATS_FIELDS.forEach(function(field) {
              res.questions[surveyQuestion.id + field].answers[answer.contactDetails[field]].count++;
            });
          }
          break;
      }

    });
  });
  
  calculateStatsPercents(res.questions, res.survey.answers);
  return res;
}

function setObjectKeyValueIfNotExists(object, key, value) {
  if (!object[key]) {
    object[key] = value;
  }
}

function populateStatsWithQuestionIfNotExists(questions, question, contactDetails) {
  if (contactDetails) {
    CONTACT_DETAILS_STATS_FIELDS.forEach(function(field) {
      let questionName = StringHelpers.upperCaseFirstLetter(field);
      setObjectKeyValueIfNotExists(questions, question.id + field, { name: questionName, answers: { } });
    });
  } else {
    if (question.type == "textarea") {
      setObjectKeyValueIfNotExists(questions, question.id, { name: question.name, values: [] });
    } else {
      setObjectKeyValueIfNotExists(questions, question.id, { name: question.name, answers: { } });
    }
  }
}

function populateStatsWithAnswerIfNotExists(questions, question, answer) {
  if (answer.contactDetails) {
    CONTACT_DETAILS_STATS_FIELDS.forEach(function(field) {
      let questionKey = question.id + field;
      answer.contactDetails[field].options.forEach(function(option) {
        setObjectKeyValueIfNotExists(questions[questionKey].answers, option, { name: option, count: 0, percent: 0 });
      });
    });
  } else if (question.type != "textarea") {
    setObjectKeyValueIfNotExists(questions[question.id].answers, answer.order, { name: answer.name, count: 0, percent: 0 });
  }
}

function calculateStatsPercents(questions, total) {
  _.forIn(questions, function(question, questionKey) {
    if (question.answers) {
       _.forIn(question.answers, function(value, key) {
        value.percent = Math.round(100 * value.count / total);
      });
    }
  });
}

function getIds(questions) {
  let ids = [];
  questions.forEach(function(question, index, array) {
    if (question.id) {
      ids.push(question.id);
    }
  });
  return ids;
};

function validUrl(survey) {
  return 'http://' + process.env.SERVER_DOMAIN + getPort() + '/survey/' + survey.id;
};

function getPort() {
  let port = ''
  if (process.env.SERVER_PORT && process.env.NODE_ENV != 'production') {
    port = ':'+ process.env.SERVER_PORT
  }
  return port
}

function validateParams(params, attributes) {
  if(_.isObject(params.SurveyQuestions)) {
    let array = [];
    _.map(params.SurveyQuestions, function(n) {
      array.push(n);
    });
    params.SurveyQuestions = array;
  }

  params.SurveyQuestions = _.remove(params.SurveyQuestions, function(n) {
    return _.isObject(n);
  });

  return _.pick(params, attributes);
};

module.exports = {
  messages: MessagesUtil.survey,
  findAllSurveys: findAllSurveys,
  findSurvey: findSurvey,
  removeSurvey: removeSurvey,
  createSurveyWithQuestions: createSurveyWithQuestions,
  updateSurvey: updateSurvey,
  changeStatus: changeStatus,
  copySurvey: copySurvey,
  answerSurvey: answerSurvey,
  confirmSurvey: confirmSurvey,
  exportSurvey: exportSurvey,
  constantsSurvey: constantsSurvey,
  canExportSurveyData: canExportSurveyData,
  getSurveyStats: getSurveyStats
};
