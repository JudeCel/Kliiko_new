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
      input: true
    },
    {
      model: 'lastName',
      name: 'Last Name',
      input: true
    },
    {
      model: 'gender',
      name: 'Gender',
      select: true,
      options: ['Male', 'Female']
    },
    {
      model: 'age',
      name: 'Age',
      input: true
    },
    {
      model: 'email',
      name: 'Email',
      input: true
    },
    {
      model: 'mobile',
      name: 'Mobile',
      input: true
    },
    {
      model: 'landlineNumber',
      name: 'Landline Number',
      input: true,
      canDisable: true,
      disabled: true
    },
    {
      model: 'postalAddress',
      name: 'Postal Address',
      input: true,
      canDisable: true,
      disabled: true
    },
    {
      model: 'city',
      name: 'City',
      input: true,
      canDisable: true,
      disabled: true
    },
    {
      model: 'state',
      name: 'State',
      input: true,
      canDisable: true,
      disabled: true
    },
    {
      model: 'postcode',
      name: 'Postcode',
      input: true,
      canDisable: true,
      disabled: true
    },
    {
      model: 'country',
      name: 'Country',
      input: true,
      canDisable: true,
      disabled: true
    },
    {
      model: 'companyName',
      name: 'Company Name',
      input: true,
      canDisable: true,
      disabled: true
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
