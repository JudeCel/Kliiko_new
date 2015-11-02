"use strict";
function rememberMe(req, done) {
  if (!!req.body.rememberMe) {
    req.session.cookie.expires = false;
    req.session.cookie.maxAge = 3600 * 720 * 1000; //30 days
    req.session.rememberMe = true;
  }else{
    req.session.rememberMe = false;
    req.session.cookie.expires = false;
    req.session.cookie.maxAge = 32 * 120 * 1000;// 1 hour
  }
  done(null, true)
}

module.exports = {
    rememberMe: rememberMe
}
