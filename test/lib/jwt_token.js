'use strict';
var assert = require('chai').assert;
var jwt_token = require('./../../lib/jwt_token');

var jwt = require('jsonwebtoken');
var config = require('config');
var JWTSecret = config.get("JWTSecret");

describe('#token', function() {
  describe('session member', function() {
    it("can decode token", function(done) {
      let member = { id: 1, role: 'role' }
      let type = 'sessionMemeber'
      let token = jwt_token.token(member, type)

      jwt.verify(token, JWTSecret, function(err, decoded) {
        if (err) {done(error)};

        assert.equal(decoded.aud.id, member.id);
        assert.equal(decoded.sub.role, member.role);
        assert.equal(decoded.iss, "KlziiChat");
        assert.equal(decoded.typ, 'token');
        assert.isNumber(decoded.exp);
        assert.isNumber(decoded.iat);
        done();

      });
    });
  });
});
