'use strict';
var MessagesUtil = require('./messages');
var recruiterSurvey = require('./surveyQuestions/recruiterSurvey');
var sessionSurvey = require('./surveyQuestions/sessionSurvey');
var _ = require('lodash');
var constants = require('./constants');

function getSurveyConstants(type) {
  let survey;
  switch (type) {
    case constants.surveyTypes.recruiter:
      survey = recruiterSurvey;
      break;
    case constants.surveyTypes.session:
      survey = sessionSurvey;
      break;
    default:
      // for now have recruiterSurvey as a default
      survey = recruiterSurvey;
  }
  let surveyBase = _.assign({}, baseSurveySetup);
  return _.merge( surveyBase, survey);
}

let baseSurveySetup = {
  minQuestions: 3,
  minsMaxs: {
    input: {
      min: 1,
      max: 100
    },
    textarea: {
      min: 1,
      max: 350
    }
  },
  validationErrors: {
    default: MessagesUtil.survey.error.default,
    unfilled: MessagesUtil.survey.error.unfilled,
    minQuestions: MessagesUtil.survey.error.minQuestions,
    field: [
      { type: 'required', message: MessagesUtil.survey.error.field.required },
      { type: 'minlength', message: MessagesUtil.survey.error.field.minlength },
      { type: 'maxlength', message: MessagesUtil.survey.error.field.maxlength }
    ],
    answer: [
      { type: 'required', message: MessagesUtil.survey.error.answer.required },
      { type: 'minlength', message: MessagesUtil.survey.error.answer.minlength },
      { type: 'maxlength', message: MessagesUtil.survey.error.answer.maxlength },
      { type: 'phoneNumber', message: MessagesUtil.survey.error.answer.phoneNumber },
      { type: 'landlineNumber', message: MessagesUtil.survey.error.answer.landlineNumber }
    ]
  }
}

module.exports = {
  getSurveyConstants: getSurveyConstants,
  surveyConstantsBase: baseSurveySetup
}
