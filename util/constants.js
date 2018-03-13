'use strict';

module.exports = {
  phoneRegExp: /^\+?(?:[0-9] ?){6,14}[0-9]$/,
  validPhoneFormat: '1 123456789',
  emailRegExp: /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
  validNameRegExp: /^[a-zA-Z -]+$/i,
  urlRegExp: /^(https?:\/\/(?:www\.|(?!www))[^\s\.]+\.[^\s]{2,}|www\.[^\s]+\.[^\s]{2,})/,
  systemRoles: ['admin', 'accountManager', 'facilitator', 'observer', 'participant'],
  sessionMemberRoles: ['facilitator', 'observer', 'participant'],
  gender: ["", "male", "female", "neither"],
  surveyTypes: {recruiter: "recruiter", sessionContactList: "sessionContactList", sessionPrizeDraw: "sessionPrizeDraw"},
  safeAccountUserParams: [
    'id',
    'firstName',
    'lastName',
    'gender',
    'active',
    'email',
    'postalAddress',
    'city',
    'state',
    'status',
    'country',
    'postCode',
    'companyName',
    'landlineNumber',
    'mobile',
    'comment',
    'phoneCountryData',
    'landlineNumberCountryData',
    'reveiveNewsLetters',
    'isRemoved'
  ],
  safeUserParams: [
    'id',
    'email',
    'selectedPlanOnRegistration'
  ],
  contactListDefaultFields: [
    "firstName", "lastName", "gender", "email", 'postalAddress',
    "city", "state", "country", "postCode", "companyName",
    "landlineNumber", "mobile"
  ],
  contactListParticipantsFields: ['Invites', 'Accept', 'NotThisTime', 'NotAtAll', 'NoReply', 'Future', 'LastSession', 'Comments'],
  contactListReqiredFields: [
    "firstName", "lastName", "email"
  ],
  originalMailTemplateFields: [
    'id', 'name', 'subject', 'content', 'systemMessage', 'category', 'mailTemplateActive'
  ],
  mailTemplateFields: [
    'id', 'name', 'subject', 'content',
    'updatedAt',
    'MailTemplateBaseId', 'AccountId', 'systemMessage', 'isCopy'
  ],
  mailTemplateFieldsForList: [
    'id', 'name', 'MailTemplateBaseId', 'AccountId', 'systemMessage', 'isCopy'
  ],
  mailTemplateType : {
    'firstInvitation' : "First Invitation",
    'closeSession' : "Close Session",
    'confirmation' : "Confirmation",
    'generic' : "Generic",
    'notAtAll' : "Not At All",
    'notThisTime' : "Not This Time",
    'accountManagerConfirmation' : "Account Manager Confirmation",
    'reactivatedAccount' : "Reactivated Account",
    'deactivatedAccount' : "Deactivated Account",
    'facilitatorConfirmation': "Host Confirmation",
    'observerInvitation' : "Spectator Invitation",
    'facilitatorOverQuota' : "Host Over-Quota",
    'invitationAcceptance' : "Invitation Acceptance",
    'sessionClosed' : "Session Closed",
    'sessionFull' : "Session Full",
    'sessionNotYetOpen' : "Session Not Yet Open",
    'passwordResetSuccess': "Reset Password Success",
    'passwordResetRequest': "Reset Password Request",
    'passwordChangeSuccess': "Change Password Success",
    'registerConfirmationEmail': "Confirmation Email",
    'registerConfirmationEmailSuccess': "Confirmation Email Success",
    'emailNotification': 'Email Notification'
  },
  externalLinks: {
    termsOfUse: 'https://cliizii.com/terms-of-use',
    termsOfUseGuest: 'https://cliizii.com/guest-terms-use',
    privacyPolicy: 'https://cliizii.com/privacy-policy/',
    privacyPolicyGuest: 'https://cliizii.com/guest-privacy-policy',
  },
  sessionListManageRoles: {
    accountUser: ['accountManager', 'admin'],
    sessionMember: ['facilitator'],
  },
  accountNameRegExp: ["^[a-zA-Z0-9 ]+$",'i'],
  restrictedAccountNames: ['chat', 'www', 'focus', 'forum', 'social forum'],
  mobileRegExp: ["^[0-9]+$",'i'],
  dateFormat: 'dd-MM-yyyy',
  dateFormatWithTime: 'dd-MM-yyyy, HH:mm',
  sessionBuilderSteps: ['setUp', 'facilitatiorAndTopics', 'manageSessionEmails',
    'manageSessionParticipants', 'inviteSessionObservers'],
  inviteStatuses: ['pending', 'confirmed', 'rejected', 'notThisTime', 'notAtAll', 'expired', 'inProgress', 'sessionFull'],
  inviteEmailStatuses: ['waiting', 'sent', 'failed'],
  sessionBuilderEmails: ['firstInvitation', 'confirmation', 'generic', 'notThisTime', 'notAtAll', 'closeSession'],
  sessionMemberNoGender: { base: 0, face: 5, body: -1, hair: -1, desk: -1, head: -1 },
  sessionMemberMan: { base: 0, face: 5, body: 5, hair: -1, desk: -1, head: -1 },
  sessionMemberWoman: { base: 0, face: 5, body: -1, hair: -1, desk: -1, head: 2 },
  validRoutePaths : ['invite', 'survey', 'my-dashboard', 'chargebee', 'api', 'unsubscribe', 'terms_of_use', 'privacy_policy', 'contactlist', 'close_session', 'system_requirements'],
  maxSessionsAmount: 1000,
  maxAccountsAmount: 100,
  defaultTopic: {
    billboardText: 'Exciting to see you all here, so let\'s get started! Click on the green button below to view the video on how to use this Chat Room.',
    video: {
      focus: {
        source: 'vimeo',
        link: '187510116'
      },
      forum: {
        source: 'vimeo',
        link: '187585089'
      },
      socialForum: {
        source: 'vimeo',
        link: '187585089'
      }
    }
  },
  sessionBuilderValidateChanges: {
    session: {
      changableFields: ["name", "startTime", "endTime", "timeZone", "resourceId", "brandProjectPreferenceId", "incentive_details", "facilitatorId"],
      notChangableFields: ["type", "anonymous", "participantListId" ]
    },
    topic: {
      listFields: ["order", "landing", "active"],
      propertyFields: ["name", "boardMessage", "sign"]
    },
    mailTemplate: {
      fields: ["content", "subject"]
    }
  },
  closeSession: {
    confirmedParticipationMessage: "That\'s great thanks, we\'ll let you know when we have another Chat Session.",
    declinedParticipationMessage: "Thanks, we\'ll make sure your\'re not asked again.",
    emailNotSent: "No close session emails sent."
  },
  emailNotifications: ['none', 'privateMessages', 'all'],
  supportedCurrencies: ['USD', 'NZD'],
  defaultCurrency: 'USD',
  supportedPlanPeriods: ['monthly', 'annual'],
  loadTestSubscriptionId: "IG5rylpQC9iyNsEON", //generate new one if you have problems
  zapierHookEvents: {
    socialForumCreated: 'social_forum_created',
    socialForumWithWrapTopicCreated: 'social_forum_with_wrap_topic_created'
  },
  zapierSubscriptionNotFoundError: 'Subscription not found',
  wrapTopicName: 'It\'s A Wrap'
}
