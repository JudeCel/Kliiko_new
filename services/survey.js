'use strict';

var models = require('./../models');
var Survey = models.Survey;
var Resource = models.Resource;
var SurveyQuestion = models.SurveyQuestion;
var SurveyAnswer = models.SurveyAnswer;

var q = require('q');
var _ = require('lodash');
var config = require('config');
var surveyConstants = require('../util/surveyConstants');

const MESSAGES = {
  notFound: 'Survey not found!',
  closed: 'Survey closed, please contact admin!',
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
    transformSurveys(surveys).then(function(transformedSurveys) {
      deferred.resolve(simpleParams(transformedSurveys));
    })
  }).catch(Survey.sequelize.ValidationError, function(error) {
    deferred.reject(prepareErrors(error));
  }).catch(function(error) {
    deferred.reject(error);
  });

  return deferred.promise;
};

function transformSurveys(surveys) {
  let deferred = q.defer();

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

  return deferred.promise;
}

function findSurvey(params) {
  let deferred = q.defer();

  Survey.find({
    where: { id: params.id },
    attributes: VALID_ATTRIBUTES.survey,
    include: [{
      model: SurveyQuestion,
      attributes: VALID_ATTRIBUTES.question
    }],
    order: [
      [SurveyQuestion, 'order', 'ASC']
    ]
  }).then(function(survey) {
    if(survey) {
      if(survey.closed) {
        deferred.reject(MESSAGES.closed);
      }
      else if(!survey.confirmedAt) {
        deferred.reject(MESSAGES.notConfirmed);
      }
      else {
        deferred.resolve(simpleParams(survey));
      }
    }
    else {
      deferred.reject(MESSAGES.notFound);
    }
  }).catch(Survey.sequelize.ValidationError, function(error) {
    deferred.reject(prepareErrors(error));
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
    deferred.reject(prepareErrors(error));
  }).catch(function(error) {
    deferred.reject(error);
  });

  return deferred.promise;
};

function createSurveyWithQuestions(params, account) {
  let deferred = q.defer();
  let validParams = validateParams(params, VALID_ATTRIBUTES.manage);
  validParams.accountId = account.id;

  models.sequelize.transaction(function (t) {
    return Survey.create(validParams, { include: [ SurveyQuestion ], transaction: t });
  }).then(function(survey) {
    survey.update({ url: validUrl(survey) }).then(function(survey) {
      deferred.resolve(simpleParams(survey, MESSAGES.created));
    });
  }).catch(Survey.sequelize.ValidationError, function(error) {
    deferred.reject(prepareErrors(error));
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
            t.commit();
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
    deferred.reject(prepareErrors(error));
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
    deferred.reject(prepareErrors(error));
  }).catch(function(error) {
    deferred.reject(error);
  });

  return deferred.promise;
};

function copySurvey(params, account) {
  let deferred = q.defer();

  Survey.find({
    where: { id: params.id, accountId: account.id },
    attributes: ['accountId', 'name', 'description', 'thanks'],
    include: [{
      model: SurveyQuestion,
      attributes: ['name', 'question', 'order', 'answers', 'type']
    }]
  }).then(function(survey) {
    if(survey) {
      createSurveyWithQuestions(survey, account).then(function(result) {
        deferred.resolve(simpleParams(result.data, MESSAGES.copied));
      }, function(error) {
        deferred.reject(error);
      });
    }
    else {
      deferred.reject(MESSAGES.notFound);
    }
  }).catch(Survey.sequelize.ValidationError, function(error) {
    deferred.reject(prepareErrors(error));
  }).catch(function(error) {
    deferred.reject(error);
  });

  return deferred.promise;
};

function answerSurvey(params) {
  let deferred = q.defer();
  let validParams = validAnswerParams(params);

  SurveyAnswer.create(validParams).then(function() {
    deferred.resolve(simpleParams(null, MESSAGES.completed));
  }).catch(SurveyAnswer.sequelize.ValidationError, function(error) {
    deferred.reject(prepareErrors(error));
  }).catch(function(error) {
    deferred.reject(error);
  });

  return deferred.promise;
};

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
    deferred.reject(prepareErrors(error));
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
    deferred.reject(prepareErrors(error));
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
        deferred.reject(prepareErrors(error));
      }).catch(function(error) {
        deferred.reject(error);
      });
    }
    else {
      question.surveyId = surveyId;
      SurveyQuestion.create(question).then(function() {
        deferred.resolve(true);
      }).catch(SurveyQuestion.sequelize.ValidationError, function(error) {
        deferred.reject(prepareErrors(error));
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
  return 'http://' + config.get('server')['domain'] + ':' + config.get('server')['port'] + '/survey/' + survey.id;
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

function prepareErrors(err) {
  let errors = ({});
  _.map(err.errors, function (n) {
    let message = n.message.replace(n.path, '');
    if(message == ' cannot be null') {
      message = ' cannot be empty';
    }
    errors[n.path] = _.startCase(n.path) + ':' + message;
  });
  return errors;
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
