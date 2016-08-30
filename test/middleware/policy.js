"use strict";
var assert = require('assert');
var expect = require("chai").expect;
var policy = require('./../../middleware/policy.js');

describe('Middleware policy', () => {
  let req = {}
  let res = { locals: {}, status: (argument) => { return { send: (test) => { return test } } } };

  describe('authorized ', () => {
    describe('success ', () => {
      it('call next Callback', (done) =>  {
        res.locals.currentDomain = {name: "dainisl", roles: ["accountManager"]};
        let result = policy.authorized(["accountManager", "admin"]);
        result(req, res, done);
      });
    });

    describe('failed ', () => {
      it('Access Denied', (done) =>  {
        res.locals.currentDomain = {name: "dainisL", roles: ["accountManager"]};
        let result = policy.authorized(["admin"])(req, res, () => {throw("can't get here")});
        assert.equal(result, policy.accessDeniedMessage);
        done();
      });

      it('it  currentDomain missing', (done) =>  {
        res = {};
        try {
          policy.authorized(["admin"])(req, res, () => {throw("can't get here")});
        } catch (error) {
          expect(error instanceof Error).to.be.true;
        } finally {
          done();
        }
      });
    });
  });
});
