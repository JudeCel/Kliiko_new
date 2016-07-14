'use strict';

module.exports = {
  minQuestions: 2,
  minsMaxs: {
    input: {
      min: 1,
      max: 30
    },
    textarea: {
      min: 1,
      max: 200
    }
  },
  validationErrors: {
    default: 'There are some errors',
    unfilled: 'There are some unfilled answers!',
    minQuestions: 'Not enough questions, needs atleast ',
    field: [
      {
        type: 'required',
        message: 'Please fill this field!',
      },
      {
        type: 'minlength',
        message: 'Field is too short!',
      },
      {
        type: 'maxlength',
        message: 'No more than 30 characters.',
      }
    ],
    answer: [
      {
        type: 'required',
        message: 'Please fill this answer!',
      },
      {
        type: 'minlength',
        message: 'Answer is too short!',
      },
      {
        type: 'maxlength',
        message: 'Answer is too long!',
      }
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
      input: true,
      order: 5
    },
    {
      model: 'landlineNumber',
      name: 'Landline Number',
      input: true,
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
      hardcodedName: true,
      checkbox: true,
      minAnswers: 1,
      maxAnswers: 1
    },
    {
      order: 7,
      name: 'Prize Draw',
      hardcodedName: true,
      checkbox: true,
      minAnswers: 1,
      maxAnswers: 1
    },
    {
      order: 8,
      name: 'Contact details',
      hardcodedName: true,
      contact: true,
      minAnswers: 1,
      maxAnswers: 1
    }
  ]
}
