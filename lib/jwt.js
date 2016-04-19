'use strict';

var jwt = require('jsonwebtoken');
var JWTSecret = process.env.JWT_SECRET_KEY;
var algorithm = 'HS512';
var issuer = 'KlziiChat';

function expDate() {
  // 3 days
  return Math.ceil(new Date().setDate(new Date().getDate() + 3) / 100);
}

function token(id) {
  let payload = {
    aud: `AccountUser:${id}`,
    sub: `AccountUser:${id}`,
    exp: expDate(),
    iss: issuer,
    typ: 'token'
  }

  return jwt.sign(payload, JWTSecret, { algorithm: algorithm });
}

module.exports = {
  token: token
}
