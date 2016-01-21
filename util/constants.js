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
    'postalAddress',
    'city',
    'state',
    'country',
    'postcode',
    'companyName',
    'landlineNumber',
    'mobile',
    'comment'
  ],
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
  dateFormat: 'MM-dd-yyyy'
}
