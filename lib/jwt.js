'use strict';

var jwt = require('jsonwebtoken');
var JWTSecret = process.env.JWT_SECRET_KEY;
var algorithm = 'HS512';
var issuer = 'KlziiChat';

const DAYS = 3;
const MILISECONDS = 100;

function token(id, redirectToChat) {
  let payload = {
    aud: `AccountUser:${id}`,
    sub: `AccountUser:${id}`,
    exp: expDate(redirectToChat),
    iss: issuer,
    typ: 'token'
  }

  if(redirectToChat) {
    return process.env.CHAT_REDIRECT_URL + jwt.sign(payload, JWTSecret, { algorithm: algorithm });
  }else{
    return jwt.sign(payload, JWTSecret, { algorithm: algorithm });
  }
}

function expDate(redirectToChat) {
  if(redirectToChat) {
    // One Minute
    var expireTime = new Date();
    return expireTime.setMinutes(expireTime.getMinutes() + 1);
  }else{
    // 3 Days
    return Math.ceil(new Date().setDate(new Date().getDate() + DAYS) / MILISECONDS);
  }
}

module.exports = {
  token: token
}
