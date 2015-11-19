"use strict";
var assert = require('assert');
var policy = require('./../../middleware/policy.js');
describe('Middleware policy', () => {
  let req = {}
  let res = { status: (argument) => { return { send: (test) => { return test } } } }
  describe('authorized ', () => {
    describe('success ', () => {
      it('call nextCallback', (done) =>  {
        req.currentDomain = {name: "dainisL", roles: ["accountManager"]}
        policy.authorized(["accountManager", "admin"], req, res, function() {
          done();
        })
      });
    });

    describe('failed ', () => {
      it('call faildeCallback', (done) =>  {
        req.currentDomain = {name: "dainisL", roles: ["accountManager"]}
        policy.authorized(["admin"], req, res, function() {}, function() {
          done();
        })
      });
    });
  });
});
