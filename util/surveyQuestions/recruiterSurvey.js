var ageOptions = require('./ageOptions')
module.exports = {
  minQuestions: 3,
  contactDetails: [
    {
      model: 'firstName',
      name: 'First Name',
      input: true,
      order: 0,
      required: true
    },
    {
      model: 'lastName',
      name: 'Last Name',
      input: true,
      order: 1,
      required: true
    },
    {
      model: 'gender',
      name: 'Gender',
      select: true,
      options: ['male', 'female'],
      order: 2,
      required: true
    },
    {
      model: 'age',
      name: 'Age',
      select: true,
      options: ageOptions.ages,
      order: 3,
      required: true
    },
    {
      model: 'email',
      name: 'Email',
      input: true,
      order: 4,
      required: true
    },
    {
      model: 'mobile',
      name: 'Mobile',
      number: true,
      canDisable: true,
      order: 5,
      required: true
    },
    {
      model: 'landlineNumber',
      name: 'Landline Number',
      number: true,
      canDisable: true,
      disabled: true,
      order: 6,
      required: true
    },
    {
      model: 'postalAddress',
      name: 'Postal Address',
      input: true,
      canDisable: true,
      disabled: true,
      order: 7,
      required: true
    },
    {
      model: 'city',
      name: 'City',
      input: true,
      canDisable: true,
      disabled: true,
      order: 8,
      required: true
    },
    {
      model: 'state',
      name: 'State',
      input: true,
      canDisable: true,
      disabled: true,
      order: 9,
      required: true
    },
    {
      model: 'postCode',
      name: 'Postcode',
      input: true,
      canDisable: true,
      disabled: true,
      order: 10,
      required: true
    },
    {
      model: 'country',
      name: 'Country',
      input: true,
      canDisable: true,
      disabled: true,
      order: 11,
      required: true
    },
    {
      model: 'companyName',
      name: 'Company Name',
      input: true,
      canDisable: true,
      disabled: true,
      order: 12,
      required: true
    },
  ],
  defaultQuestions: [
    {
      order: 0,
      name: 'First Choice',
      question: 'e.g. Which ONE of these is your FIRST choice for (product/service type)?',
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
      question: 'e.g. Which ONE of these is your SECOND choice for (product/service type)?',
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
      question: 'e.g. What advice would you like to give to (Brand Name) to improve (product/service)?',
      answers: [ { placeHolder: 'Answer - 200 Character Limit', order: 0 } ],
      textArea: true,
      minAnswers: 1,
      maxAnswers: 1
    },
    {
      order: 3,
      name: 'Like-Dislike',
      question: 'e.g. Please play the audio/video clip first, and then select how much you like or dislike (subject description)?',
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
      maxAnswers: 7,
      expandable: true
    },
    {
      order: 4,
      name: 'Importance',
      question: 'e.g. How important is it for (brand/organisation) to provide (product/service)?',
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
      maxAnswers: 7,
      expandable: true
    },
    {
      order: 5,
      name: 'Most Important',
      question: 'e.g. Which ONE of these product/service features is the MOST important to you?',
      answers: [
        { name: 'Feature', order: 0 },
        { name: 'Feature', order: 1 },
        { name: 'Feature', order: 2 },
        { name: 'Don\'t know', order: 3 }
      ],
      input: true,
      minAnswers: 2,
      maxAnswers: 7,
      expandable: true
    },
    {
      order: 6,
      name: 'Interest',
      question: "e.g. Are you interested in taking part in a future online discussion group, about (brand/product/service)?\nIt'll be easy and fun, chatting with others and making a difference.\nIf Yes, we'll need your Contact Details, so we can keep in touch.\nPlease also see our Privacy Policy below.\nYou must be aged 18 or over to participate.",
      hardcodedName: true,
      answers: [
        { name: 'Yes - I am aged 18 or over & give you permission to contact me in future about a discussion group', order: 0, tag: 'InterestYesTag' },
        { name: 'No', order: 1 }
      ],
      link: { name: 'Privacy Policy', url: '/privacy_policy' },
      input: true,
      required: true,
      minAnswers: 2,
      maxAnswers: 2,
      type: 'radio'
    },
    {
      order: 7,
      name: 'Contact Details',
      question: 'If you answered Yes, please complete your Contact Details. All information is confidential and will not be shared with other parties.',
      hardcodedName: true,
      hardcodedQuestion: true,
      required: true,
      contact: true,
      minAnswers: 0,
      maxAnswers: 0,
      handleTag: 'InterestYesTag',
      type: 'input'
    }
  ],
  tableOfContents: [
    {
      customTemplate: true,
      tag: "intro"
    },
    {
      header: true
    },
    {
      questions: true,
      interval: [0, 3]
    },
    {
      customTemplate: true,
      tag: "0"
    },
    {
      questions: true,
      interval: [3, 6]
    },
    {
      customTemplate: true,
      tag: "1"
    },
    {
      questions: true,
      interval: [6, 10]
    },
    {
      footer: true
    }
  ]
}
