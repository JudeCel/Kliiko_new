'use strict';

module.exports = {
  phoneRegExp: /^\+?(?:[0-9] ?){6,14}[0-9]$/,
  validPhoneFormat: '1 123456789',
  emailRegExp: /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
  validNameRegExp: /^[a-zA-Z -]+$/i,
  systemRoles: ['admin', 'accountManager', 'facilitator', 'observer', 'participant'],
  sessionMemberRoles: ['facilitator', 'observer', 'participant'],
  gender: ["", "male", "female"],
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
    'reveiveNewsLetters'
  ],
  safeUserParams: [
    'id',
    'email'
  ],
  contactListDefaultFields: [
    "firstName", "lastName", "gender", "email", 'postalAddress',
    "city", "state", "country", "postCode", "companyName",
    "landlineNumber", "mobile"
  ],
  originalMailTemplateFields: [
    'id', 'name', 'subject', 'content', 'systemMessage', 'category', 'mailTemplateActive'
  ],
  mailTemplateFields: [
    'id', 'name', 'subject', 'content',
    'MailTemplateBaseId', 'AccountId', 'systemMessage', 'isCopy', 'sessionId'
  ],
  mailTemplateFieldsForList: [
    'id', 'name', 'MailTemplateBaseId', 'AccountId', 'systemMessage', 'isCopy', 'sessionId'
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
    'facilitatorConfirmation': "Facilitator Confirmation",
    'observerInvitation' : "Observer Invitation",
    'facilitatorOverQuota' : "Facilitator Over-Quota",
    'invitationAcceptance' : "Invitation Acceptance",
    'sessionClosed' : "Session Closed",
    'sessionFull' : "Session Full",
    'sessionNotYetOpen' : "Session Not Yet Open",
    'passwordResetSuccess': "Reset Password Success",
    'passwordResetRequest': "Reset Password Request",
    'passwordChangeSuccess': "Change Password Success",
    'registerConfirmationEmail': "Confirmation Email",
    'registerConfirmationEmailSuccess': "Confirmation Email Success"
  },
  sessionListManageRoles: {
    accountUser: ['accountManager', 'admin'],
    sessionMember: ['facilitator'],
  },
  accountNameRegExp: ["^[a-zA-Z0-9]+$",'i'],
  mobileRegExp: ["^[0-9]+$",'i'],
  galleryUploadTypes: ['image', 'brandLogo', 'audio', 'youtubeLink', 'text'],
  dateFormat: 'MM-dd-yyyy',
  dateFormatWithTime: 'MM-dd-yyyy, HH:mm',
  sessionBuilderSteps: ['setUp', 'facilitatiorAndTopics', 'manageSessionEmails',
    'manageSessionParticipants', 'inviteSessionObservers', 'done'],
  inviteStatuses: ['pending', 'confirmed', 'rejected', 'notThisTime', 'notAtAll', 'expired'],
  sessionBuilderEmails: ['firstInvitation', 'confirmation', 'generic', 'notThisTime', 'notAtAll', 'closeSession'],
  sessionMemberMan: { base: 0, face: 5, body: 5, hair: -1, desk: -1, head: -1 },
  sessionMemberWoman: { base: 0, face: 5, body: -1, hair: -1, desk: -1, head: 2 },
  validRoutePaths : ['invite', 'survey', 'my-dashboard', 'chargebee', 'api', 'unsubscribe']
}
