'use strict';

var assert = require('chai').assert;
var jwt_token = require('./../../lib/jwt');

var jwt = require('jsonwebtoken');
var JWTSecret = process.env.JWT_SECRET_KEY;

describe('#token', function() {
  describe('account user', function() {
    it("can decode token", function(done) {
      let id = 1;
      let token = jwt_token.token(id);

      jwt.verify(token, JWTSecret, function(err, decoded) {
        if (err) {done(error)};

        assert.equal(decoded.aud, `AccountUser:${id}`);
        assert.equal(decoded.sub, `AccountUser:${id}`);
        assert.equal(decoded.iss, 'KlziiChat');
        assert.equal(decoded.typ, 'token');
        assert.isNumber(decoded.exp);
        assert.isNumber(decoded.iat);
        done();
      });
    });
  });
});
