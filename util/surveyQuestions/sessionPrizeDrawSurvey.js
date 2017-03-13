var ageOptions = require('./ageOptions')

module.exports = {
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
      model: 'email',
      name: 'Email',
      input: true,
      order: 2
    },
    {
      model: 'mobile',
      name: 'Mobile',
      number: true,
      canDisable: true,
      order: 3
    },
    {
      model: 'gender',
      name: 'Gender',
      select: true,
      options: ['male', 'female'],
      order: 4
    },
    {
      model: 'age',
      name: 'Age',
      select: true,
      options: ageOptions.ages,
      order: 5
    }
  ],
  defaultQuestions: [
    {
      order: 0,
      name: 'Interest',
      question: "But would you still like to be in the Prize Draw? If Yes, we'll just need some brief contact details.",
      hardcodedName: true,
      answers: [
        { name: 'Yes - I am aged 18 or over & give you permission to contact me in future about a discussion group', order: 0, tag: 'InterestYesTag' },
        { name: 'No', order: 1 }
      ],
      link: { name: 'Privace Policy', url: '/privacy_policy' },
      input: true,
      required: true,
      minAnswers: 2,
      maxAnswers: 2
    },
    {
      order: 1,
      name: 'Contact Details',
      question: 'If you answered Yes, please complete your Contact Details. All information is confidential and will not be shared with other parties.',
      hardcodedName: true,
      hardcodedQuestion: true,
      required: true,
      contact: true,
      minAnswers: 0,
      maxAnswers: 0,
      handleTag: 'InterestYesTag'
    }
  ],
  tableOfContents: [
    {
      questions: true,
      interval: [0, 2]
    },
    {
      footer: true
    }
  ]
}