'use strict';

module.exports = {
  emailRegExp: /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i,
  systemRoles: ['admin', 'accountManager', 'facilitator', 'observer', 'participant'],
  safeUserParams: [
    'id',
    'firstName',
    'lastName',
    'email',
    'gender',
    'mobile',
    'landlineNumber',
    'postalAddress',
    'city',
    'state',
    'postcode',
    'country',
    'companyName'
  ],
  promotionCodeTypes: ['percentage', 'value'],
  dateFormat: 'MM-dd-yyyy',
  mobileRegExp: ["^[0-9]+$",'i'],
  accountNameRegExp: ["^[a-zA-Z0-9]+$",'i']
}
