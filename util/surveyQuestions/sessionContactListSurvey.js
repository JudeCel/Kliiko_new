var ageOptions = require('./ageOptions')

module.exports = {
  minQuestions: 1,
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
    },
    {
      model: 'gender',
      name: 'Gender',
      select: true,
      options: ['male', 'female'],
      canDisable: true,
      order: 4,
      required: false
    },
    {
      model: 'age',
      name: 'Age',
      select: true,
      options: ageOptions.ages,
      canDisable: true,
      order: 5,
      required: false
    }
  ],
  defaultQuestions: [
    {
      order: 0,
      name: 'Interest',
      question: "e.g. Are you interested in taking part in a future online discussion group, about (brand/product/service)?\nIt'll be easy and fun, chatting with others and making a difference.\nIf Yes, we'll need your Contact Details, so we can keep in touch.\nPlease also see our Privacy Policy below.\nYou must be aged 18 or over to participate.",
      hardcodedName: true,
      answers: [
        { name: 'Yes - I am aged 18 or over & give you permission to contact me in future about a discussion group', order: 0, tag: 'InterestYesTag' },
        { name: 'No', order: 1 }
      ],
      link: { name: 'Privace Policy', url: '/privacy_policy' },
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
    },
    {
      order: 2,
      name: 'First Choice',
      hardcodedName: true,
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
  ],
  tableOfContents: [
    {
      questions: true,
      interval: [0, 3]
    },
    {
      footer: true
    }
  ]
}
