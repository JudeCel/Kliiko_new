module.exports = {
  account: {
    notFound: 'Account not found',
    accountExists: 'You already have allowed amount of own Accounts',
    created: 'Your New Account has been created, please check your email to Confirm',
    empty: "Account name can't be empty",
  },
  accountDatabase: {
    notFound: 'Account User not found',
    notVerified: 'Account is not verified',
    selfDisable: 'You cannot disable your account',
    adminNotFound: 'Admin not found with email:'
  },
  accountManager: {
    removed: 'Successfully removed account from Account List',
    updated: 'Account manager was successfully updated.',
    notFound: 'Account Manager not found',
    notFoundOrOwner: 'Account Manager not found or you are not an owner',
    error: {
      selfInvite: 'You are trying to invite yourself.',
      alreadyInvited: 'This user is already invited.',
      alreadyAccepted: 'This user has already accepted invite.'
    }
  },
  accountUser: {
    notFound: 'Account User not found'
  },
  banner: {
    notFound: 'Banner not found',
    exists: 'Banner already exists',
    created: 'Banner created successfully',
    updated: 'Banner updated successfully'
  },
  brandColour: {
    notFound: 'Scheme not found!',
    removed: 'Scheme removed successfully!',
    created: 'Scheme created successfully!',
    copied: 'Scheme copied successfully!',
    updated: 'Scheme updated successfully!',
    notValid: 'Not valid colour'
  },
  changePassword: {
    fillBoth: 'Please fill both password fields.',
    notEqual: 'Passwords not equal',
    success: 'Password was changed successfully'
  },
  contactListImport: {
    notFound: 'ContactList not found!',
    error: {
      fieldRequired: 'Required',
      emailTaken: 'Email already taken',
      emailInvalidFormat: 'Email has invalid format',
      wrongFormat: 'Wrong file format: ',
      wrongGender: 'Gender is incorrect',
      invalidFormat: 'Invalid format'
    }
  },
  contactListUser: {
    notFound: 'Contact List User not found',
  },
  emailConfirmation: {
    error: {
      token: 'Failed create token',
      user: 'User not found'
    }
  },
  invite: {
    confirmed: 'You have successfully accepted Invite. Please login using your invite e-mail and password.',
    removed: 'Successfully removed Invite',
    cantRemove: "Can't remove this invite",
    sessionIsFull: 'Session is full',
    inviteExpired: 'This invite is not active anymore',
    declined: 'Successfully declined invite',
    notFound: 'Invite not found'
  },
  mailTemplate: {
    notFound: 'Mail Template not found',
    error: {
      categoryNotFound: 'Mail Template category not found',
      notProvided: 'Mail Template not provided'
    },
    testMailSent: 'A Test Email has been successfully sent'
  },
  resetPassword: {
    error: {
      mailNotFound: 'E-mail not found',
      userNotFound: 'User not found'
    }
  },
  session: {
    notFound: 'Session not found',
    removed: 'Session sucessfully removed',
    copied: 'Session sucessfully copied',
    sessionMemberNotFound: 'Session Member not found',
    rated: 'Session Member rated',
    commentChanged: 'Comment updated successfully',
    cannotBeChanged: 'Session cannot be changed',
    cantRateSelf: "You can't rate your self",
    sessionNotClosed: "You can't rate or comment participants because session in not closed",
  },
  sessionBuilder: {
    setUp: "You have successfully setted up your chat session.",
    cancel: "Session build successfully canceled",
    notFound: "Session build not found",
    inviteNotFound: 'Invite not found or is not pending',
    inviteRemoved: 'Invite removed successfully',
    sessionMemberNotFound: 'Session Member not found',
    sessionMemberRemoved: 'Session Member removed successfully',
    accountUserNotFound: 'Account User not found',
    sessionClosed: "You can't send invites because session has been closed",
    cantRemoveInvite: {
      messages: "Is posted messages"
    },

    errors: {
      cantAddObservers: "Please Update your subscription plan, to invite Spectators to your session.",
      cantSendCloseMails: "Were not able to send emails to inform all participants, that session was closed.",
      firstStep: {
        nameRequired: 'Name must be provided',
        typeRequired: 'Type must be selected',
        startTimeRequired: 'Start time must be provided',
        endTimeRequired: 'End time must be provided',
        invalidDateRange: "Start date can't be higher then end date",
        invalidEndTime: "End time can't be equal to start time",
        facilitator: 'No host provided'
      },
      secondStep: {
        topics: 'No topics selected',
        stock: "You can't drag a Stock Topic. Edit to suit your needs and Save which creates either a New Topic or a Copy Of."
      },
      thirdStep: {
        emailTemplates: "You need to copy each of the required e-mail template."
      },
      fourthStep: {
        participants: 'No guests invited'
      },
      fifthStep: {
        observers: 'No specators invited'
      },
      invalidStep: "Invalid step"
    }
  },
  sessionMember: {
    notFound: 'Session Member not found'
  },
  socialProfile: {
    verifyEmail: 'Please verify your email address'
  },
  subscription: {
    notFound: {
      subscription: 'No subscription found',
      accountUser: 'No account user found',
      subscriptionPlan: 'No plan found',
      account: 'No account found.'
    },
    validation: {
      session: 'You have to many sessions',
      survey: 'You have to many surveys',
      contactList: 'You have to many contact lists',
    },
    alreadyExists: 'Subscription already exists',
    cantSwitchPlan: "Can't switch to current plan",
    successPlanUpdate: 'Plan was successfully updated.',
    quoteSent: "Thanks, your email has been sent. We'll be in touch within 24 hours.",
    errorInField: 'Please provide: ',
    emailFormat: 'E-mail format is not valid',
    contactNumberFormat: 'Contact Number format is not valid',
    urlFormat: 'URL format is not valid'
  },
  subscriptionAddon: {
    successfulPurchase: 'You have sucessfully purchased additional sms credits.',
    notAllowed: 'You must have plan that allows you to buy additional sms credits',
    missingQuantity: 'Quantity not selected'
  },
  contactList: {
    notFound: 'Contact List not found!',
  },
  survey: {
    cantExportSurveyData: 'Please Update your subscription plan, to export survey data.',
    notFound: 'Survey not found!',
    cantDelete: 'Sorry, you can\'t delete this survey!',
    alreadyClosed: 'Sorry, this survey has now closed. Thanks for your interest!',
    notConfirmed: 'Survey not confirmed, please contact admin!',
    removed: 'Successfully removed survey!',
    completed: 'Successfully completed survey!',
    noConstants: 'No constants found!',
    created: 'Successfully created survey!',
    updated: 'Successfully updated survey!',
    closed: 'Survey has been successfully closed!',
    opened: 'Survey has been successfully opened!',
    copied: 'Survey copied successfully!',
    confirmed: 'Survey confirmed successfully!',
    error: {
      default: 'There are some errors',
      unfilled: 'There are some unfilled answers!',
      minQuestions: 'Not enough questions, needs atleast ',
      field: {
        required: 'Please fill this field!',
        minlength: 'Field is too short!',
        maxlength: 'No more than XXX characters.'
      },
      answer: {
        required: 'Please fill this answer!',
        minlength: 'Answer is too short!',
        maxlength: 'Answer is too long!',
        phoneNumber: 'Invalid phone number.',
        landlineNumber: 'Invalid phone number.',
      }
    }
  },
  topics: {
    updatedSessionTopic: 'Session Topic was successfully updated.',
    error: {
      relatedSession: "Can't delete topic is related session",
      default: "Can't delete default topic",
      stock: "Can't delete stock topic"
    }
  },
  users: {
    agreeTOC: 'You must agree to the Terms & Conditions before Sign up.',
    alreadyChanged: 'Password already changed.',
    dialog: {
      emailExists: "You already have a Role in the system. Please Login.",
      emailExistsCanCreateAccount: "That's great you want your own Account! Because you already have a Role in klzii, you can login as normal. Then click on My Details, to create a Free Account.",
      invitationAccepted: "Hey, we see you have Accepted an invitation to a Session. Create your password, then you can create your Account from My Dashboard later."
    }
  },
  validators: {
    subscription: {
      error: {
        inactiveSubscription: "Your subscription is expired, please update your subscription plan.",
        noSubscription: "You don't have a subscription. Please purchase a plan.",
        account: 'Account not found',
        brandLogoAndCustomColors: 'but _planName_ does not allow you to upload a Brand Logo or change Color Scheme of the Chat Room. Please Upgrade Your Plan.',
        uploadToGallery: 'but _planName_ does not allow you to upload Upload any Multimedia files for viewing in your Chat Session. Multimedia is a valuable part of the Chat Room experience, and we have supplied some Stock files for your use. But if you would like to Upload your own files, please Upgrade Your Plan.',
        exportContactListAndParticipantHistory: 'but reporting function is only available on Paid Plans. If you want to view either a PDF, CSV, or TXT Report you can Upgrade your Plan now, to access a Report of this Session.',
        accountUserCount: 'you have reached the limit of Account Managers available for your current Plan. Please Upgrade your Plan to add more.'
      },
      planDoesntAllowToDoThis: 'Please update your subscription plan to one that includes this feature.',
      notFound: 'No subscription found',
      notValidDependency: 'Not valid dependency',
      inactiveSubscription: 'Your subscription is expired, please update your subscription plan.',
      countLimit: 'You have reached limit for _name_s (max: _max_number_)',
      recruiterCountLimitJunior_Trial: 'Please upgrade your Plan. You can only have _max_number_ Open Social OR Survey Recruiter on the ',
      recruiterCountLimitCore: 'Please upgrade your Plan. You can only have _max_number_ Open Social OR Survey Recruiter OR a combination of one each on the Core Plan.',
      recruiterCountLimitSenior: 'Please upgrade your Plan. You can only have _max_number_ Open Social OR Survey Recruiters OR a combination on the Senior Plan.'
    }
  },
  models: {
    accountUser: {
      landlineNumber: 'Invalid phone number format (ex. XXX)',
      mobile: 'Invalid phone number format (ex. XXX)',
      email: 'Email has already been taken'
    },
    session: {
      date: "Start date can't be higher then end date."
    },
    user: {
      password: 'Make sure your Password is at least 7 characters'
    },
    validations: {
      length: {
        min: ' must be longer than XXX characters',
        max: ' must not be longer than XXX characters'
      },
      firstLastName: 'Invalid XXX format'
    },
    filters: {
      uniqueAccountName: 'Name has already been taken',
      empty: " can't be empty",
      format: ' has invalid format',
      unique: ' has already been taken',
    }
  },
  middleware: {
    passport: {
      userPasswordMatch: 'Sorry, your Email and Password do not match. Please try again.',
      userNotFound: 'User not found',
      notConfirmed: 'Your account has not been confirmed, please check your e-mail and follow the link.'
    },
    policy: {
      noAccess: 'Access denied to this page!'
    },
    subdomain: {
      deactivated: 'Sorry, your account has been deactivated. Please get in touch with the administration',
      noAccessOrNotFound: 'Account not found or you do not have access to this page'
    }
  },
  lib: {
    jwt: {
      notPart: 'You are not part of this session'
    },
    twilio: {
      allSmsSent: 'All sms have been sent'
    }
  },
  smsService: {
    validation: {
      failed: "You want to send ${smsCount} SMS but current available SMS count is ${currentSmsCount}"
    }
  },
  routes: {
    accountDatabase: {
      success: 'Successfully updated account user'
    },
    accountManager: {
      invite: 'Successfully sent invite.'
    },
    sessionBuilder: {
      invite: 'Successfully invited contacts'
    },
    user: {
      updateContactDetails: 'Contact details updated successfully.'
    },
    sessionMember: {
      addFacilitator: 'Host was successfully set'
    },
    contactList: {
      created: 'Successfully created contact list',
      updated: 'Successfully updated contact list',
      removed: 'Successfully removed contact list'
    },
    contactListUser: {
      newUser: 'New contact was added sucessfully',
      newFacilitator: 'New host was added sucessfully',
      updated: 'Contact has been updated sucessfully',
      imported: 'Contacts has been imported sucessfully'
    },
    mailTemplates: {
      saved: 'Template was successfully saved.'
    },
    topic: {
      created: 'Topic created successfully',
      updated: 'Topic updated successfully',
      removed: 'Topic removed successfully',
    }
  },
  sessionBuilderValidateChanges: {
    canChange: "What are the odds of you and someone else editing the same thing at the same time... so which edit do you want saved?",
    canNotChange: "Sorry, you can not change this option anymore, because it was already changed by someone else."
  }
};
