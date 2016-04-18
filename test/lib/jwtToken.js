'use strict';
var assert = require('chai').assert;
var jwt_token = require('./../../lib/jwtToken');

var jwt = require('jsonwebtoken');
var JWTSecret = process.env.JWT_SECRET_KEY;

describe('#token', function() {
  describe('session member', function() {
    it("can decode token", function(done) {
      let member = { id: 1, role: 'role' }
      let type = 'SessionMemeber'
      let token = jwt_token.token(member, type)

      jwt.verify(token, JWTSecret, function(err, decoded) {
        if (err) {done(error)};

        assert.equal(decoded.aud, `${type}:${member.id}`);
        assert.equal(decoded.sub, `${type}:${member.id}`);
        assert.equal(decoded.iss, "KlziiChat");
        assert.equal(decoded.typ, 'token');
        assert.isNumber(decoded.exp);
        assert.isNumber(decoded.iat);
        done();

      });
    });
  });
});
