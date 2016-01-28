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
     "landlineNumber", "mobile", "id"
  ],
  promotionCodeTypes: ['percentage', 'value'],
  galleryUploadTypes: ['image', 'brandLogo', 'audio', 'youtubeLink', 'text'],
  dateFormat: 'MM-dd-yyyy'
}
