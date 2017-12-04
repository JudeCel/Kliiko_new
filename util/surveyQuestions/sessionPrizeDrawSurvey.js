var ageOptions = require('./ageOptions')

module.exports = {
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
      model: 'email',
      name: 'Email',
      input: true,
      order: 2,
      required: true
    },
    {
      model: 'mobile',
      name: 'Mobile',
      number: true,
      canDisable: true,
      order: 3,
      required: false
    }
  ],
  defaultQuestions: [
    {
      order: 0,
      name: 'Interest',
      question: "Would you like to be in the Prize Draw? If Yes, we'll just need some brief contact details.",
      hardcodedName: true,
      answers: [
        { name: 'Yes - I am aged 18 or over & give you permission to contact me about the Prize Draw', order: 0, tag: 'InterestYesTag' },
        { name: 'No', order: 1 }
      ],
      link: { name: 'Privacy Policy', url: 'https://klzii.com/privacy-policy/' },
      input: true,
      required: true,
      minAnswers: 2,
      maxAnswers: 2,
      type: 'radio'
    },
    {
      order: 1,
      name: 'Contact Details',
      question: 'If you answered Yes, please complete your Contact Details. All information is confidential and will not be shared with other parties.',
      textarea: true,
      hardcodedName: true,
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
      header: true,
      headerContent: {
        name: false,
        logo: false,
        textArea: true
      }
    },
    {
      questions: true,
      interval: [0, 2]
    },
    {
      footer: true
    }
  ]
}
