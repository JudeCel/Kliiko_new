'use strict';

module.exports = {
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
    'postcode',
    'companyName',
    'landlineNumber',
    'mobile',
    'comment'
  ],
  safeUserParams: [
    'id',
    'email'
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
