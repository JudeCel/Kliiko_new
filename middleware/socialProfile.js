"use strict";
var q = require('q');
function google(profile, attrs) {
  attrs.firstName = profile.name.givenName;
  attrs.lastName = profile.name.familyName;
  attrs.email = profile.emails[0].value;
  attrs.socialProfile = { provider: profile.provider, id: profile.id }
}
function facebook(profile, attrs) {
  attrs.firstName = profile._json.first_name;
  attrs.lastName = profile._json.last_name;
  attrs.socialProfile = { provider: profile.provider, id: profile.id }
  if (profile._json.email) {
    attrs.email = profile._json.email;
  }
}

function assignProfileData(profile, userAttrs) {
  let deferred = q.defer();
  let providers = {
    google: google,
    facebook: facebook
  };
  let provider = providers[profile.provider];

  if (provider) {
    provider(profile, userAttrs);
    deferred.resolve(userAttrs);
  }else{
    deferred.reject(new Error("Social profile provider not found " + profile.provider));
  }

  return deferred.promise;
}

module.exports = {
  assignProfileData: assignProfileData,
}
