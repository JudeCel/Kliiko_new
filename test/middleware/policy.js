"use strict";
var assert = require('assert');
var expect = require("chai").expect;
var policy = require('./../../middleware/policy.js');
describe('Middleware policy', () => {
  let req = {}
  let res = { status: (argument) => { return { send: (test) => { return test } } } }
  let next = function(done) {
    return done()
  }
  describe('authorized ', () => {
    describe('success ', () => {
      it('call next Callback', (done) =>  {
        req.currentDomain = {name: "dainisL", roles: ["accountManager"]}
        let result = policy.authorized(["accountManager", "admin"])
        result(req, res, done)
      });
    });

    describe('failed ', () => {
      it('Access Denied', (done) =>  {
        req.currentDomain = {name: "dainisL", roles: ["accountManager"]}
        let result = policy.authorized(["admin"])(req, res, () => {throw("can't get here")})
        assert.equal(result, policy.accessDeniedMessage);
        done();
      });

      it('it  currentDomain missing', (done) =>  {
        req = {}
        try {
          policy.authorized(["admin"])(req, res, () => {throw("can't get here")})
        } catch (error) {
          expect(error instanceof Error).to.be.true;
        } finally {
          done();
        }
      });
    });
  });
});
