'use strict';

module.exports = {
  phoneRegExp: /^\+?(?:[0-9] ?){6,14}[0-9]$/,
  validPhoneFormat: '1 123456789',
  emailRegExp: /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i,
  systemRoles: ['admin', 'accountManager', 'facilitator', 'observer', 'participant'],
  sessionMemberRoles: ['facilitator', 'observer', 'participant'],
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
    'landlineNumberCountryData'
  ],
  safeUserParams: [
    'id',
    'email'
  ],
  contactListDefaultFields: [
    "firstName", "lastName", "gender", "email", "city",
    "state", "country", "postCode", "companyName",
    "landlineNumber", "mobile"
  ],
  originalMailTemplateFields: [
    'id', 'name', 'subject', 'content', 'systemMessage', 'category', 'mailTemplateActive'
  ],
  mailTemplateFields: [
    'id', 'name', 'subject', 'content',
    'MailTemplateBaseId', 'AccountId', 'systemMessage'
  ],
  mailTemplateFieldsForList: [
    'id', 'name', 'MailTemplateBaseId', 'AccountId', 'systemMessage'
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
  promotionCodeTypes: ['percentage', 'value'],
  accountNameRegExp: ["^[a-zA-Z0-9]+$",'i'],
  mobileRegExp: ["^[0-9]+$",'i'],
  galleryUploadTypes: ['image', 'brandLogo', 'audio', 'youtubeLink', 'text'],
  dateFormat: 'MM-dd-yyyy',
  sessionBuilderSteps: ['setUp', 'facilitatiorAndTopics', 'manageSessionEmails',
    'manageSessionParticipants', 'inviteSessionObservers', 'done'],
  inviteStatuses: ['pending', 'confirmed', 'rejected', 'notThisTime', 'notAtAll', 'expired']
}
