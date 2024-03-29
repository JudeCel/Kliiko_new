"use strict";
var assert = require('assert');
var models  = require('./../../models');
var constants = require('../../util/constants')
var MessagesUtil = require('../../util/messages');
var testDatabase = require("../database");
var Account  = models.Account;
var encryptedPasswordLength = 60;

describe('Account', () => {
  describe('uniq account name',  ()=>  {
    beforeEach((done) => {
      testDatabase.prepareDatabaseForTests().then(() => {
        done();
      });
    });

    it('can update', (done) =>  {
      let attrs = {
        name: "DainisL",
      }
      Account.create(attrs)
        .then(function(account) {
          assert.equal(account.name, attrs.name);
          account.update(attrs)
            .then(function(account) {
              done();
            }).catch(function() {
              done("Not get here");
            });
        }).catch(function(error) {
          assert.equal(error, undefined);
          done(error);
        });
    });

    describe("validation cases", ()=> {
      describe("same characters", () => {
        beforeEach((done) => {
          Account.create({name: "DainisL"})
          .then(function(_) {
            done();
          }).catch(function(error) {
            done(error);
          });
        });

        it('Failed, same characters', (done) =>  {
          let attrs = {
            name: "Dainis L",
          };
          Account.create(attrs)
          .then(function(account) {
            done("Not get here");
          }).catch(function(error) {
            assert.equal(error.errors[0].path, "name");
            done();
          });
        });
      });

      it('banned characters', (done) =>  {
        let attrs = {
          name: "!@#$%^&*()_+|?~",
        }
        Account.build(attrs).validate()
        .then(function(error) {
          assert.equal(error.errors[0].path, "name");
          done()
        })
      });

      it('allowed characters', (done) =>  {
        let attrs = {
          name: "allowed spaces",
        }
        let account = Account.build(attrs)
        account.validate()
        .then(function(error) {
          assert.equal(account.name, attrs.name);
          assert.equal(error, undefined);
          done()
        })
      });

      it('should fail due to restricted account name', (done) => {
        let attrs = {
          name: constants.restrictedAccountNames[0],
        }
        Account.create(attrs).then(function(account) {
          done("Shouldn't create account");
        }).catch(function(error) {
          assert.equal(error.errors[0].message, MessagesUtil.models.validations.restrictedAccountName);
          done();
        });
      });
    });
  });
});
