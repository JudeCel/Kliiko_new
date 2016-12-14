'use strict';

module.exports = {
  phoneRegExp: /^\+?(?:[0-9] ?){6,14}[0-9]$/,
  validPhoneFormat: '1 123456789',
  emailRegExp: /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
  validNameRegExp: /^[a-zA-Z -]+$/i,
  urlRegExp: /^(https?:\/\/(?:www\.|(?!www))[^\s\.]+\.[^\s]{2,}|www\.[^\s]+\.[^\s]{2,})/,
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
  contactListReqiredFields: [
    "firstName", "lastName", "email"
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
    'registerConfirmationEmailSuccess': "Confirmation Email Success"
  },
  sessionListManageRoles: {
    accountUser: ['accountManager', 'admin'],
    sessionMember: ['facilitator'],
  },
  accountNameRegExp: ["^[a-zA-Z0-9 ]+$",'i'],
  mobileRegExp: ["^[0-9]+$",'i'],
  galleryUploadTypes: ['image', 'brandLogo', 'audio', 'youtubeLink', 'text'],
  dateFormat: 'MM-dd-yyyy',
  dateFormatWithTime: 'MM-dd-yyyy, HH:mm',
  sessionBuilderSteps: ['setUp', 'facilitatiorAndTopics', 'manageSessionEmails',
    'manageSessionParticipants', 'inviteSessionObservers'],
  inviteStatuses: ['pending', 'confirmed', 'rejected', 'notThisTime', 'notAtAll', 'expired', 'inProgress'],
  inviteEmailStatuses: ['waiting', 'sent', 'failed'],
  sessionBuilderEmails: ['firstInvitation', 'confirmation', 'generic', 'notThisTime', 'notAtAll', 'closeSession'],
  sessionMemberNoGender: { base: 0, face: 5, body: -1, hair: -1, desk: -1, head: -1 },
  sessionMemberMan: { base: 0, face: 5, body: 5, hair: -1, desk: -1, head: -1 },
  sessionMemberWoman: { base: 0, face: 5, body: -1, hair: -1, desk: -1, head: 2 },
  validRoutePaths : ['invite', 'survey', 'my-dashboard', 'chargebee', 'api', 'unsubscribe', 'terms_of_use', 'privacy_policy'],
  maxSessionsAmount: 1000,
  maxAccountsAmount: 100,
  membersAllowedCount: {
    observers: -1,
    participantsFocus: 8,
    participantsForum: -1,
  }
}
