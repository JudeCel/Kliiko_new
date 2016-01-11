"use strict";
var q = require('q');

function assignProfileData(profile, userAttrs) {
  let deferred = q.defer();
  let error = null;
  switch(profile.provider){
    case 'google':
      userAttrs.firstName = profile.name.familyName;
      userAttrs.lastName = profile.name.givenName;
      userAttrs.email = profile.emails[0].value;
      userAttrs.socialProfile = { provider: profile.provider, id: profile.id }
      break;
    case 'facebook':
      userAttrs.firstName = profile._json.first_name;
      userAttrs.lastName = profile._json.last_name;
      userAttrs.socialProfile = { provider: profile.provider, id: profile.id }
      if (profile._json.email) {
        userAttrs.email = profile._json.email;
      }
      break;
    default:
      error = new Error("Social profile provider not found " + profile.provider);
  }
  if (error) {
    deferred.reject(error);
  }else {
    deferred.resolve(userAttrs);
  }
  return deferred.promise;
}

module.exports = {
  assignProfileData: assignProfileData,
}
