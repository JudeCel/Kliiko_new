'use strict';

function createUserSession(req, done) {
  let standardExpiryTime = 3600 * 1000; // 1h
  let rememberMeExpiryTime = standardExpiryTime * 240; // 10 days
  req.session.cookie.expires = true;

  if(!!req.body.rememberMe) {
    req.session.maxLength = rememberMeExpiryTime;
    req.session.cookie.maxAge = rememberMeExpiryTime;
  }
  else {
    req.session.maxLength = standardExpiryTime;
    req.session.cookie.maxAge = standardExpiryTime;
  }

  done();
}

function extendUserSession(req, res, next) {
  req.session.cookie.maxAge = req.session.maxLength;
  req.session.save(function(error) {
    next(error);
  });
}

module.exports = {
  createUserSession: createUserSession,
  extendUserSession: extendUserSession
}
