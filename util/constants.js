'use strict';

module.exports = {
  phoneRegExp: /^\+(?:[0-9] ?){6,14}[0-9]$/,
  emailRegExp: /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i,
  systemRoles: ['admin', 'accountManager', 'facilitator', 'observer', 'participant'],
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
    'comment'
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
    'id',
    'name',
    'subject',
    'content',
    'systemMessage'
  ],
  mailTemplateFields: [
    'id',
    'name',
    'subject',
    'content',
    'MailTemplateBaseId',
    'UserId',
    'systemMessage'
  ],
  mailTemplateFieldsForList: [
    'id',
    'name',
    'MailTemplateBaseId',
    'UserId',
    'systemMessage'
  ],

  promotionCodeTypes: ['percentage', 'value'],
  accountNameRegExp: ["^[a-zA-Z0-9]+$",'i'],
  mobileRegExp: ["^[0-9]+$",'i'],
  galleryUploadTypes: ['image', 'brandLogo', 'audio', 'youtubeLink', 'text'],
  dateFormat: 'MM-dd-yyyy'
}
