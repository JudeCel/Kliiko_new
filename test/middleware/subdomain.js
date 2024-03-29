"use strict";
var assert = require("chai").assert;
var expect = require("chai").expect;
var subdomain = require('./../../middleware/subdomain.js');
var UserServices  = require('./../../services/users');
var models  = require('./../../models');
var testDatabase = require("../database");

var validAttrs = {
  accountName: "DainisL",
  subdomain: "dainisl",
  firstName: "Dainis",
  lastName: "Lapins",
  password: "cool_password",
  email: "dainis@gmail.com",
  gender: "male"
}

describe('Middleware subdomain', () => {

  let req = { subdomains: [validAttrs.subdomain], user: {id: null} }
  let res = { locals: {} };

  beforeEach((done) => {
    testDatabase.prepareDatabaseForTests().done((error, result) => {
      UserServices.create(validAttrs, function(errors, user) {
        req.user.id = user.id
        done();
      });
    });
  });

  describe('success ', () => {
    it('call next Callback', (done) =>  {
      subdomain(req, res, done);
    });

    it('assign currentDomain to res locaCallback', (done) =>  {
      models.Account.findAll({include: [models.AccountUser]}).then((result) => {
        subdomain(req, res, () => {
          let currentResources = {
            account: { id: result[0].id, name: result[0].name, subdomain: result[0].subdomain, admin: result[0].admin },
            accountUser: {id: result[0].AccountUsers[0].id, role: result[0].AccountUsers[0].role},
            user: {id: result[0].AccountUsers[0].UserId, email: "dainis@gmail.com", selectedPlanOnRegistration: null}
          }

          try {
            assert.deepEqual(req.currentResources, currentResources);
            done();
          } catch (e) {
            done(e);
          }
        });
      })
    });
  });

  describe('failed ', () => {
    it('Access Denied', (done) =>  {
      req.subdomains = ["wrongSubdomain"];
      let res = { locals: {}, status: (argument) => { return { send: (test) => {
        assert.equal(test, 'Account not found or you do not have access to this page');
        done();
      } } } };

      subdomain(req, res, () => { throw("can't get here") });
    });
  });
});
