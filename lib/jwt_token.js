'use strict';

var jwt = require('jsonwebtoken');
var config = require('config');
var JWTSecret = config.get("JWTSecret");
var algorithm = 'HS512';
var issuer = "KlziiChat";

function expDate() {
  return Math.ceil(new Date().setDate(new Date().getDate() + 3) / 100)
}

function token(member, type) {
  let payload = {
    aud: { id: member.id, type: type, role: member.role},
    sub: { id: member.id, type: type, role: member.role},
    exp:  expDate(),
    iss: issuer,
    typ: "token"
  }

  return jwt.sign(payload, JWTSecret, { algorithm: algorithm });
}

module.exports = {
  token: token
}
