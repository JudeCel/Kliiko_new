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
  promotionCodeTypes: ['percentage', 'value'],
  dateFormat: 'MM-dd-yyyy'
}
