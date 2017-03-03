'use strict';
var MessagesUtil = require('./messages');
var recruiterSurvey = require('./surveyQuestions/recruiterSurvey');
var sessionSurvey = require('./surveyQuestions/sessionSurvey');
var _ = require('lodash');

function getSurveyConstants(type) {
  let survey;
  switch (type) {
    case 'recruiter':
      survey = recruiterSurvey;
      break;
    case 'session':
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
  },
  contactDetails: [
    {
      model: 'firstName',
      name: 'First Name',
      input: true,
      order: 0
    },
    {
      model: 'lastName',
      name: 'Last Name',
      input: true,
      order: 1
    },
    {
      model: 'gender',
      name: 'Gender',
      select: true,
      options: ['male', 'female'],
      order: 2
    },
    {
      model: 'age',
      name: 'Age',
      select: true,
      options: ['Under 18', '18-19', '20-24', '25-29', '30-34', '35-39', '40-44', '45-49', '50-54', '55-59', '60-64', '65-69', '70+'],
      order: 3
    },
    {
      model: 'email',
      name: 'Email',
      input: true,
      order: 4
    },
    {
      model: 'mobile',
      name: 'Mobile',
      number: true,
      canDisable: true,
      order: 5
    },
    {
      model: 'landlineNumber',
      name: 'Landline Number',
      number: true,
      canDisable: true,
      disabled: true,
      order: 6
    },
    {
      model: 'postalAddress',
      name: 'Postal Address',
      input: true,
      canDisable: true,
      disabled: true,
      order: 7
    },
    {
      model: 'city',
      name: 'City',
      input: true,
      canDisable: true,
      disabled: true,
      order: 8
    },
    {
      model: 'state',
      name: 'State',
      input: true,
      canDisable: true,
      disabled: true,
      order: 9
    },
    {
      model: 'postCode',
      name: 'Postcode',
      input: true,
      canDisable: true,
      disabled: true,
      order: 10
    },
    {
      model: 'country',
      name: 'Country',
      input: true,
      canDisable: true,
      disabled: true,
      order: 11
    },
    {
      model: 'companyName',
      name: 'Company Name',
      input: true,
      canDisable: true,
      disabled: true,
      order: 12
    },
  ]
}

module.exports = {
  getSurveyConstants: getSurveyConstants,
  surveyConstantsBase: baseSurveySetup
}
