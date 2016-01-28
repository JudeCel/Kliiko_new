'use strict';

module.exports = {
  minQuestions: 2,
  minsMaxs: {
    input: {
      min: 1,
      max: 20
    },
    textarea: {
      min: 1,
      max: 500
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
        message: 'Field is too long!',
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
      options: ['Male', 'Female'],
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
      model: 'postcode',
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
      input: true,
      minAnswers: 2,
      maxAnswers: 5
    },
    {
      order: 1,
      name: 'Second Choice',
      input: true,
      minAnswers: 2,
      maxAnswers: 5
    },
    {
      order: 2,
      name: 'Advice',
      textArea: true,
      minAnswers: 1,
      maxAnswers: 1
    },
    {
      order: 3,
      name: 'Like-Dislike',
      input: true,
      audioVideo: true,
      minAnswers: 2,
      maxAnswers: 5
    },
    {
      order: 4,
      name: 'Importance',
      input: true,
      audioVideo: true,
      minAnswers: 2,
      maxAnswers: 5
    },
    {
      order: 5,
      name: 'Most Important',
      input: true,
      minAnswers: 2,
      maxAnswers: 5
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
