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
    'postCode',
    'country',
    'companyName'
  ],
  promotionCodeTypes: ['percentage', 'value'],
  dateFormat: 'MM-dd-yyyy',
  contactListDefaultFields: ["firstName", "lastName", "gender", "email", "city",
                              "state", "country", "postCode", "companyName",
                              "landlineNumber", "mobile"
                            ]
};
