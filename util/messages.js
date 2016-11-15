module.exports = {
  account: {
    notFound: 'Account not found',
    accountExists: 'You already have an Account',
    created: 'Your New Account has been created, please check your email to Confirm',
    empty: "Account name can't be empty",
  },
  accountDatabase: {
    notFound: 'Account User not found',
    notVerified: 'Account is not verified',
    selfDisable: 'You cannot disable your account'
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
    }
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
    cantRateSelf: "You can't rate your self",
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

    errors: {
      cantAddObservers: "Please Update your subscription plan, to invite Observers to your session.",
      cantSendCloseMails: "Were not able to send emails to inform all participants, that session was closed.",
      firstStep: {
        nameRequired: 'Name must be provided',
        typeRequired: 'Type must be selected',
        startTimeRequired: 'Start time must be provided',
        endTimeRequired: 'End time must be provided',
        invalidDateRange: "Start date can't be higher then end date",
        invalidEndTime: "End time can't be equal to start time",
        facilitator: 'No facilitator provided'
      },
      secondStep: {
        topics: 'No topics selected'
      },
      thirdStep: {
        emailTemplates: "You need to copy each of the required e-mail template."
      },
      fourthStep: {
        participants: 'No participants invited'
      },
      fifthStep: {
        observers: 'No observers invited'
      }
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
    quoteSent: "Thanks, your email has been sent. We'll be in touch withing 24 hours.",
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
      relatedSession: "Can't delete topic is related session"
    }
  },
  users: {
    agreeTOC: 'You must agree to the Terms & Conditions before Sign up.',
    alreadyChanged: 'Password already changed.',
    dialog: {
      emailExists: "You already have a Role in the system. Please Login.",
      emailExistsCanCreateAccount: "You already have a Role in the system, you can Create a New Account from your Dashboard. Please Login.",
      emailExistsContinueToCheckIn: "Sorry, you currently cannot Create a New Account, because you have already Accepted a Session Invitation. \
        Please continue to Ckeck-In from your Confirmation Email to enter the Session. \
        You will be able to Create a New Account when you Leave the Session and go to My Dashboard."
    }
  },
  validators: {
    subscription: {
      error: {
        inactiveSubscription: "Your subscription is expired, please update your subscription plan.",
        noSubscription: "You don't have a subscription. Please purchase a plan.",
        account: 'Account not found'
      },
      planDoesntAllowToDoThis: 'Please update your subscription plan to one that includes this feature.',
      notFound: 'No subscription found',
      notValidDependency: 'Not valid dependency',
      inactiveSubscription: 'Your subscription is expired, please update your subscription plan.',
      countLimit: 'You have reached limit for XXXs (max: YYY)'
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
      addFacilitator: 'Facilitator was successfully set'
    },
    contactList: {
      created: 'Successfully created contact list',
      updated: 'Successfully updated contact list',
      removed: 'Successfully removed contact list'
    },
    contactListUser: {
      newUser: 'New contact was added sucessfully',
      newFacilitator: 'New facilitator was added sucessfully',
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
  }
};
