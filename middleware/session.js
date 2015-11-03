"use strict";
function rememberMe(req, done) {
  let rememberMeExpiryTime = 3600 * 720 * 1000 // ~30 days
  let standardExpiryTime = 300 * 320 * 1000 // ~1 day
  req.session.cookie.expires = true;

  if (!!req.body.rememberMe) {
    req.session.cookie.maxAge = rememberMeExpiryTime;
    req.session.rememberMe = true;
  }else{
    req.session.rememberMe = false;
    req.session.cookie.maxAge = standardExpiryTime;
  }
  done(null, true)
}

module.exports = {
    rememberMe: rememberMe
}
