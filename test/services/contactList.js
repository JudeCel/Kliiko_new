"use strict";
var assert = require('chai').assert;
var models  = require('./../../models');
var ContactListService  = require('./../../services/contactList');
var UserService  = require('./../../services/users');
var constants = require('./../../util/constants');

describe('Services -> ContactList', () => {
  describe('create',  () => {
    var validAttrs = {
      accountName: "DainisL",
      firstName: "Dainis",
      lastName: "Lapins",
      password: "cool_password",
      email: "dainis@gmail.com",
      gender: "male"
    }

    beforeEach((done) => {
      models.sequelize.sync({force: true}).done((error, result) => {
        done();
      });
    });

    afterEach(function(done) {
      models.sequelize.sync({force: true}).done((error, result) => {
        done();
      });
    });


    describe("succsess", function() {
      let TestUser = null;
      let TestAccount = null;

      beforeEach((done)=> {
        UserService.create(validAttrs, function(errors, user) {
          user.getOwnerAccount().then(function(results) {
            TestAccount = results[0]
            TestUser = user;
            done();
          });
        });
      })


      it("createDefaultLists by default user flow", (done) => {
        TestAccount.getContactLists().then(function(CLResults) {
          assert.equal(CLResults.length, 3);
          assert.equal(CLResults[0].editable, false);
          assert.sameMembers(CLResults[0].defaultFields, constants.contactListDefaultFields);
          assert.isArray(CLResults[0].customFields);
          done()
        });
      });

      it("create", (done) => {
        let attrs = {
          accountId: TestAccount.id,
          name: "cool list",
          customFields: ["one", "two", "three"]
         }

        ContactListService.create(attrs).then(function(contactList) {
          assert.equal(contactList.name, attrs.name);
          assert.isTrue(contactList.editable);
          assert.sameMembers(contactList.defaultFields, constants.contactListDefaultFields);
          assert.sameMembers(contactList.customFields, attrs.customFields);
          done();
        }, function(err) {
          done(err);
        });
      });

      it("destroy", (done) => {
        let attrs = {
          accountId: TestAccount.id,
          name: "customList",
          customFields: ["one", "two", "three"]
         }

        ContactListService.create(attrs).then(function(contactList) {
          ContactListService.destroy(contactList.id, TestAccount.id).then(function(result) {
            TestAccount.getContactLists().then(function(CLResults) {
              assert.equal(CLResults.length, 3);
              done();
            }, function(err) {
              done(err);
            })
          },function(err) {
            done(err);
          })
        }, function(err) {
          done(err);
        });
      })
    });

    describe("failed", function() {
      let TestAccount = null;
      let TestUser = null;
      beforeEach((done) => {
        models.sequelize.sync({force: true}).done((error, result) => {
          UserService.create(validAttrs, function(errors, user) {
            user.getOwnerAccount().then(function(results) {
              TestAccount = results[0]
              TestUser = user;
              done();
            });
          });
        });
      });

      it("create", (done) => {
        let attrs = {
          accountId: TestAccount.id,
          name: "Facilitators",
          customFields: ["one", "two", "three"]
        }

        ContactListService.create(attrs).then(function(_contactList) {
          done("should not get there!!");
        }, function(err) {
          assert.isObject(err)
          done();
        });
      });
    });
  });

  describe('#parseFile', function() {
    var testFile = 'test/fixtures/contactList/list_valid.csv';

    describe.only('happy path', function() {
      it('should succeed', function(done) {
        ContactListService.parseFile(testFile).then(function(result) {
          assert.deepEqual(result.invalid, []);
          done();
        }, function(error) {
          done(error);
        });
      });
    });

    describe('sad path', function() {

    });
  });

});
