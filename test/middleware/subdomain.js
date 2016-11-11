"use strict";
var assert = require("chai").assert;
var expect = require("chai").expect;
var subdomain = require('./../../middleware/subdomain.js');
var UserServices  = require('./../../services/users');
var models  = require('./../../models');

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
    models.sequelize.sync({force: true}).done((error, result) => {
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
      models.Account.findAll().then(function(result) {
        subdomain(req, res, function() {
          assert.deepEqual(res.locals.currentDomain, {realName: result[0].name, id: result[0].id, name: validAttrs.subdomain, roles: ["accountManager"] });
          done();
        });
      })
    });

    describe('hasAccess ', () => {
      before((done) => {
        subdomain(req, res, done);
      });

      it('assign currentDomain to res locaCallback', () =>  {
        assert.isFunction(res.locals.hasAccess)
      });
    })
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
