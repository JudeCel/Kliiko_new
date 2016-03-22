'use strict';

var models = require('./../models');
var filters = require('./../models/filters');
var Survey = models.Survey;
var Resource = models.Resource;
var SurveyQuestion = models.SurveyQuestion;
var SurveyAnswer = models.SurveyAnswer;
var Resource = models.Resource;
var ContactList = models.ContactList;
var contactListUserServices = require('./../services/contactListUser');

var async = require('async');
var q = require('q');
var _ = require('lodash');
var surveyConstants = require('../util/surveyConstants');

const MESSAGES = {
  notFound: 'Survey not found!',
  alreadyClosed: 'Survey closed, please contact admin!',
  notConfirmed: 'Survey not confirmed, please contact admin!',
  removed: 'Successfully removed survey!',
  completed: 'Successfully completed survey!',
  noConstants: 'No constants found!',
  created: 'Successfully created survey!',
  updated: 'Successfully updated survey!',
  closed: 'Survey has been successfully closed!',
  opened: 'Survey has been successfully opened!',
  copied: 'Survey copied successfully!',
  confirmed: 'Survey confirmed successfully!'
};

const VALID_ATTRIBUTES = {
  manage: [
    'accountId',
    'resourceId',
    'confirmedAt',
    'name',
    'closed',
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
    'answers'
  ]
}

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
    include: [
      {
        model: Resource
      },
      {
      model: SurveyQuestion,
      attributes: VALID_ATTRIBUTES.question,
      include: [{
        model: Resource
      }]
    }]
  }).then(function(surveys) {
    surveys.forEach(function(survey, index, array) {
      if(survey.Resource){
        survey.Resource.JSON = JSON.parse(decodeURI(survey.Resource.JSON));
      }
      survey.SurveyQuestions.forEach(function(question, index, array) {
        if(question.Resource){
          question.Resource.JSON = JSON.parse(decodeURI(question.Resource.JSON));
        }
      });
    });
    deferred.resolve(simpleParams(surveys));
  }).catch(Survey.sequelize.ValidationError, function(error) {
    deferred.reject(filters.errors(error));
  }).catch(function(error) {
    deferred.reject(error);
  });

  return deferred.promise;
};

function findSurvey(params) {
  let deferred = q.defer();

  Survey.find({
    where: { id: params.id },
    attributes: VALID_ATTRIBUTES.survey,
    include: [
      {
        model: Resource
      },
      {
        model: SurveyQuestion,
        attributes: VALID_ATTRIBUTES.question,
        include: [{ model: Resource }]
      }
    ],
    order: [
      [SurveyQuestion, 'order', 'ASC']
    ]
  }).then(function(survey) {
    if(survey) {
      if(survey.closed) {
        deferred.reject(MESSAGES.alreadyClosed);
      }
      else if(!survey.confirmedAt) {
        deferred.reject(MESSAGES.notConfirmed);
      }
      else {
        if(survey.Resource){
          survey.Resource.JSON = JSON.parse(decodeURI(survey.Resource.JSON));
        }

        survey.SurveyQuestions.forEach(function(question, index, array) {
          if(question.Resource){
            question.Resource.JSON = JSON.parse(decodeURI(question.Resource.JSON));
          }
        });

        deferred.resolve(simpleParams(survey));
      }
    }
    else {
      deferred.reject(MESSAGES.notFound);
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

  Survey.destroy({ where: { id: params.id, accountId: account.id } }).then(function(result) {
    if(result > 0) {
      deferred.resolve(simpleParams(null, MESSAGES.removed));
    }
    else {
      deferred.reject(MESSAGES.notFound);
    }
  }).catch(Survey.sequelize.ValidationError, function(error) {
    deferred.reject(filters.errors(error));
  }).catch(function(error) {
    deferred.reject(error);
  });

  return deferred.promise;
};

function createOrUpdateContactList(accountId, fields, t) {
  let deferred = q.defer();

  ContactList.find({
    where: {
      name: 'Survey',
      accountId: accountId
    }
  }).then(function(contactList) {
    if(contactList) {
      fillCustomFields(fields, contactList);
      contactList.customFields = _.uniq(contactList.customFields);

      contactList.save().then(function(contactList) {
        deferred.resolve(contactList);
      }).catch(ContactList.sequelize.ValidationError, function(error) {
        deferred.reject(filters.errors(error));
      }).catch(function(error) {
        deferred.reject(error);
      });
    }
    else {
      contactList = ContactList.build({
        name: 'Survey',
        accountId: accountId,
        editable: false,
      }, { transaction: t });

      fillCustomFields(fields, contactList);

      contactList.save().then(function(contactList) {
        deferred.resolve(contactList);
      }).catch(ContactList.sequelize.ValidationError, function(error) {
        deferred.reject(filters.errors(error));
      }).catch(function(error) {
        deferred.reject(error);
      });
    }
  }).catch(ContactList.sequelize.ValidationError, function(error) {
    deferred.reject(filters.errors(error));
  }).catch(function(error) {
    deferred.reject(error);
  });

  return deferred.promise;
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
  let validParams = validateParams(params, VALID_ATTRIBUTES.manage);
  validParams.accountId = account.id;

  models.sequelize.transaction(function (t) {
    return Survey.create(validParams, { include: [ SurveyQuestion ], transaction: t }).then(function(survey) {
      let fields = getContactListFields(survey.SurveyQuestions);

      return createOrUpdateContactList(survey.accountId, fields, t).then(function(contactList) {
        return survey;
      }, function(error) {
        throw error;
      });
    });
  }).then(function(survey) {
    survey.update({ url: validUrl(survey) }).then(function(survey) {
      deferred.resolve(simpleParams(survey, MESSAGES.created));
    });
  }).catch(Survey.sequelize.ValidationError, function(error) {
    deferred.reject(filters.errors(error));
  }).catch(function(error) {
    deferred.reject(error);
  });

  return deferred.promise;
};

function updateSurvey(params, account) {
  let deferred = q.defer();
  let validParams = validateParams(params, VALID_ATTRIBUTES.manage);

  models.sequelize.transaction(function (t) {
    return Survey.update(validParams, {
      where: { id: params.id, accountId: account.id },
      include: [ SurveyQuestion ],
      returning: true,
      transaction: t
    }).then(function(result) {
      if(result[0] == 0) {
        throw MESSAGES.notFound;
      }
      else {
        let survey = result[1][0];
        return SurveyQuestion.destroy({
          where: {
            surveyId: survey.id,
            id: { $notIn: getIds(validParams.SurveyQuestions) }
          },
          transaction: t
        }).then(function() {
          return bulkUpdateQuestions(survey.id, validParams.SurveyQuestions, t).then(function() {
            return survey;
          }, function() {
            t.rollback();
            return survey;
          });
        });
      }
    });
  }).then(function(survey) {
    deferred.resolve(simpleParams(survey, MESSAGES.updated));
  }).catch(Survey.sequelize.ValidationError, function(error) {
    deferred.reject(filters.errors(error));
  }).catch(function(error) {
    deferred.reject(error);
  });

  return deferred.promise;
};

function changeStatus(params, account) {
  let deferred = q.defer();

  Survey.update({ closed: params.closed }, {
    where: { id: params.id, accountId: account.id },
    returning: true
  }).then(function(result) {
    if(result[0] == 0) {
      deferred.reject(MESSAGES.notFound);
    }
    else {
      let survey = result[1][0];
      deferred.resolve(simpleParams(survey, survey.closed ? MESSAGES.closed : MESSAGES.opened));
    }
  }).catch(Survey.sequelize.ValidationError, function(error) {
    deferred.reject(filters.errors(error));
  }).catch(function(error) {
    deferred.reject(error);
  });

  return deferred.promise;
};

function copySurvey(params, account) {
  let deferred = q.defer();

  Survey.find({
    where: { id: params.id, accountId: account.id },
    attributes: ['accountId', 'name', 'description', 'thanks', 'resourceId'],
    include: [
      Resource,
      {
        model: SurveyQuestion,
        attributes: ['name', 'question', 'order', 'answers', 'type', 'resourceId'],
        include: Resource
      }
    ]
  }).then(function(survey) {
    if(survey) {

      createSurveyWithQuestions(survey, account).then(function(result) {

        async.parallel({
          survey: function(callback) {
            copySurveyResources(result.data, callback)
          },
          questions: function(callback) {
            copyQuestionResources(result.data, callback)
          }
        }, function(err, copyed) {
          findCopyedSurvey(copyed.survey).then(function(result) {
            deferred.resolve(simpleParams(result, MESSAGES.copied));
          })
        });

      }, function(error) {
        deferred.reject(error);
      });
    }
    else {
      deferred.reject(MESSAGES.notFound);
    }
  }).catch(Survey.sequelize.ValidationError, function(error) {
    deferred.reject(filters.errors(error));
  }).catch(function(error) {
    deferred.reject(error);
  });

  return deferred.promise;
};

function findCopyedSurvey(survey) {
  let deferred = q.defer();

  Survey.find({
    where: {id: survey.id},
    attributes: VALID_ATTRIBUTES.survey,
    include: [
      {
        model: Resource
      },
      {
        model: SurveyQuestion,
        attributes: VALID_ATTRIBUTES.question,
        include: [{ model: Resource }]
      }
    ],
    order: [
      [SurveyQuestion, 'order', 'ASC']
    ]
  }).then(function(survey) {

    if(survey.Resource){
      survey.Resource.JSON = JSON.parse(decodeURI(survey.Resource.JSON));
    }

    survey.SurveyQuestions.forEach(function(question, index, array) {
      if(question.Resource){
        question.Resource.JSON = JSON.parse(decodeURI(question.Resource.JSON));
      }
    });

    deferred.resolve(survey);
  })

  return deferred.promise;
}

function copySurveyResources(survey, callback) {
  if(survey.resourceId){
    createNewResource(survey.resourceId).then(function(result) {
      Survey.update({resourceId: result.id}, {
        where: {id: survey.id},
        returning: true
      }).then(function(updatedSurvey) {
        callback(null, updatedSurvey[1][0]);
      })
    })
  }else{
    callback(null, survey)
  }
}

function copyQuestionResources(survey, callback) {
  let questionsProcessed = 0;

  survey.SurveyQuestions.forEach(function(question) {
    if(question.resourceId){
      createNewResource(question.resourceId);
    }

    questionsProcessed++;

    if(questionsProcessed === survey.SurveyQuestions.length) {
      callback();
    }
  });
}

function createNewResource(resourceId){
  let deferred = q.defer();

  Resource.find({
    where: {id: resourceId},
    attributes: ['topicId', 'userId', 'thumb_URL', 'URL', 'HTML', 'JSON', 'resourceType']
  }).then(function(resource) {
    Resource.create({
      topicId: resource.topicId,
      userId: resource.userId,
      thumb_URL: resource.thumb_URL,
      URL: resource.URL,
      HTML: resource.HTML,
      JSON: resource.JSON,
      resourceType: resource.resourceType
    }).then(function(copyedResource) {
      deferred.resolve(copyedResource);
    })
  })

  return deferred.promise;
}

function answerSurvey(params) {
  let deferred = q.defer();
  let validParams = validAnswerParams(params);

  models.sequelize.transaction(function (t) {
    return Survey.find({ where: { id: validParams.surveyId }, include: [SurveyQuestion] }).then(function(survey) {
      return SurveyAnswer.create(validParams, { transaction: t }).then(function() {
        let fields = getContactListFields(survey.SurveyQuestions);

        return createOrUpdateContactList(survey.accountId, fields, t).then(function(contactList) {
          if(!_.isEmpty(fields)) {
            let clParams = findContactListAnswers(contactList, validParams.answers);
            clParams.contactListId = contactList.id;
            clParams.accountId = survey.accountId;

            return contactListUserServices.create(clParams).then(function(result) {
              return survey;
            }, function(error) {
              throw error;
            });
          }
          else {
            return survey;
          }
        }, function(error) {
          throw error;
        });
      });
    })
  }).then(function(survey) {
    deferred.resolve(simpleParams(null, MESSAGES.completed));
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
    if(object.contactDetails) {
      values = object.contactDetails;
    }
  });

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
}

function confirmSurvey(params, account) {
  let deferred = q.defer();

  Survey.update({ confirmedAt: params.confirmedAt }, {
    where: { id: params.id, accountId: account.id },
    returning: true
  }).then(function(result) {
    if(result[0] == 0) {
      deferred.reject(MESSAGES.notFound);
    }
    else {
      let survey = result[1][0];
      deferred.resolve(simpleParams(survey, MESSAGES.confirmed));
    }
  }).catch(Survey.sequelize.ValidationError, function(error) {
    deferred.reject(filters.errors(error));
  }).catch(function(error) {
    deferred.reject(error);
  });

  return deferred.promise;
};

function exportSurvey(params, account) {
  let deferred = q.defer();

  Survey.find({
    where: { id: params.id, accountId: account.id },
    attributes: ['id'],
    include: [{
      model: SurveyQuestion,
      attributes: VALID_ATTRIBUTES.question
    }, SurveyAnswer],
    order: [
      [SurveyQuestion, 'order', 'ASC']
    ]
  }).then(function(survey) {
    if(survey) {
      let header = createCsvHeader(survey.SurveyQuestions);
      let data = createCsvData(header, survey);
      deferred.resolve(simpleParams({ header: header, data: data }));
    }
    else {
      deferred.reject(MESSAGES.notFound);
    }
  }).catch(Survey.sequelize.ValidationError, function(error) {
    deferred.reject(filters.errors(error));
  }).catch(function(error) {
    deferred.reject(error);
  });

  return deferred.promise;
};

function constantsSurvey() {
  let deferred = q.defer();

  if(surveyConstants) {
    deferred.resolve(simpleParams(surveyConstants));
  }
  else {
    deferred.reject(MESSAGES.noConstants);
  }

  return deferred.promise;
};

// Helpers
function createCsvHeader(questions) {
  let array = [];
  questions.forEach(function(question) {
    array.push(question.name);
    if(question.answers[0].contactDetails) {
      question.answers[0].contactDetails.forEach(function(contact) {
        array.push(contact.name);
      });
    }
  });

  return array;
};

function createCsvData(header, survey) {
  let array = [];

  survey.SurveyAnswers.forEach(function(surveyAnswer) {
    let object = {};

    survey.SurveyQuestions.forEach(function(question, index) {
      let answer = surveyAnswer.answers[question.id];

      switch(answer.type) {
        case 'number':
          assignNumber(index, header, object, question, answer);
          break;
        case 'string':
          object[header[index]] = answer.value;
          break;
        case 'boolean':
          assignBoolean(index, header, object, question, answer);
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

function assignBoolean(index, header, object, question, answer) {
  object[header[index]] = answer.value ? 'Yes' : 'No';
  if(answer.contactDetails) {
    _.map(answer.contactDetails, function(value, key) {
      object[_.startCase(key)] = value;
    });
  }
};

function validAnswerParams(params) {
  let surveyAnswer = { surveyId: params.surveyId, answers: {} };
  for(let i in params.SurveyQuestions) {
    let question = params.SurveyQuestions[i];
    if(!surveyAnswer.answers[i]) {
      surveyAnswer.answers[i] = {};
    }

    surveyAnswer.answers[i].type = typeof question.answer;
    surveyAnswer.answers[i].value = question.answer;
    if(question.answer && question.contactDetails) {
      surveyAnswer.answers[i].contactDetails = question.contactDetails;
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

function getIds(questions) {
  let ids = [];
  questions.forEach(function(question, index, array) {
    ids.push(question.id);
  });
  return ids;
};

function validUrl(survey) {
  return 'http://' + process.env.SERVER_DOMAIN + ':' + process.env.SERVER_PORT + '/survey/' + survey.id;
};

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
  messages: MESSAGES,
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
  constantsSurvey: constantsSurvey
};
