'use strict';
var MessagesUtil = require('./messages');

module.exports = {
  minQuestions: 3,
  minsMaxs: {
    input: {
      min: 1,
      max: 30
    },
    textarea: {
      min: 1,
      max: 300
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
      input: true,
      canDisable: true,
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
  ],
  defaultQuestions: [
    {
      order: 0,
      name: 'First Choice',
      question: 'Which ONE of these is your FIRST choice for (product/service type)?',
      answers: [
        { name: 'Brand Name', order: 0 },
        { name: 'Brand Name', order: 1 },
        { name: 'Brand Name', order: 2 },
        { name: "Don't Know", order: 3 }
      ],
      input: true,
      minAnswers: 2,
      maxAnswers: 5
    },
    {
      order: 1,
      name: 'Second Choice',
      question: 'Which ONE of these is your SECOND choice for (product/service type)?',
      answers: [
        { name: 'Brand Name', order: 0 },
        { name: 'Brand Name', order: 1 },
        { name: 'Brand Name', order: 2 },
        { name: "Don't Know", order: 3 }
      ],
      input: true,
      minAnswers: 2,
      maxAnswers: 5
    },
    {
      order: 2,
      name: 'Advice',
      question: 'What advice would you like to give to (Brand Name) to improve (product/service)?',
      answers: [ { placeHolder: 'Answer - 200 Character Limit', order: 0 } ],
      textArea: true,
      minAnswers: 1,
      maxAnswers: 1
    },
    {
      order: 3,
      name: 'Like-Dislike',
      question: 'Please play the audio/video clip first, and then select how much you like or dislike (subject description)?',
      answers: [
        { name: 'Like A Lot', order: 0 },
        { name: 'Like', order: 1 },
        { name: 'Neither Like or Dislike', order: 2 },
        { name: 'Dislike', order: 3 },
        { name: 'Dislike A Lot', order: 4 },
        { name: "Don't Know", order: 5 }
      ],
      input: true,
      audioVideo: true,
      minAnswers: 2,
      maxAnswers: 7
    },
    {
      order: 4,
      name: 'Importance',
      question: 'How important is it for (brand/organisation) to provide (product/service)?',
      answers: [
        { name: 'Very Important', order: 0 },
        { name: 'Fairly Important', order: 1 },
        { name: 'Not Very Important', order: 2 },
        { name: 'Not At All Important', order: 3 },
        { name: "Don't Know", order: 4 }
      ],
      input: true,
      audioVideo: true,
      minAnswers: 2,
      maxAnswers: 7
    },
    {
      order: 5,
      name: 'Most Important',
      question: 'Which ONE of these product/service features is the MOST important to you?',
      answers: [
        { name: 'Feature', order: 0 },
        { name: 'Feature', order: 1 },
        { name: 'Feature', order: 2 },
        { name: 'Feature', order: 3 }
      ],
      input: true,
      minAnswers: 2,
      maxAnswers: 7
    },
    {
      order: 6,
      name: 'Interest',
      question: "Would you be interested in taking part in a future online discussion group, about (brand/product/service)? It'll be easy and fun, chatting with others like yourself. And if you participate there'll also be a gift for your help.",
      hardcodedName: true,
      required: true,
      checkbox: true,
      minAnswers: 1,
      maxAnswers: 1
    },
    {
      order: 7,
      name: 'Prize Draw',
      question: 'Would you like to be in the draw for (prize)?',
      hardcodedName: true,
      checkbox: true,
      minAnswers: 1,
      maxAnswers: 1
    },
    {
      order: 8,
      name: 'Contact Details',
      question: 'To finish, we just need your Contact Details. Your information will remain confidential and not be shared with other parties. Please see our Privacy Policy below. If you do not want to provide your details, you will not be eligible for a discussion group and the prize draw.',
      hardcodedName: true,
      required: true,
      contact: true,
      minAnswers: 1,
      maxAnswers: 1
    }
  ]
}
