"use strict";
var assert = require('chai').assert;
var models  = require('./../../models');
var ContactListService  = require('./../../services/contactList');
var UserService  = require('./../../services/users');
var constants = require('./../../util/constants');
var userFixture = require('./../fixtures/user');

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
    var testUser, testAccount;
    var testFile = 'test/fixtures/contactList/list_valid.csv';

    beforeEach(function(done) {
      userFixture.createUserAndOwnerAccount().then(function(result) {
        testUser = result.user;
        testAccount = result.account;
        done();
      }, function(error) {
        done(error);
      });
    });

    afterEach(function(done) {
      models.sequelize.sync({ force: true }).then(() => {
        done();
      });
    });

    describe('happy path', function() {
      it('should succeed', function(done) {
        let attrs = {
          accountId: testAccount.id,
          name: 'cool list',
          customFields: ['one', 'two', 'three']
        }

        ContactListService.create(attrs).then(function(contactList) {
          ContactListService.parseFile(contactList.id, testFile).then(function(result) {
            assert.deepEqual(result.invalid, []);
            assert.equal(result.valid[0].firstName, 'user');
            assert.equal(result.valid[0].lastName, 'insider user');
            assert.equal(result.valid[0].gender, 'male');
            assert.equal(result.valid[0].email, 'user@insider.com');
            assert.equal(result.valid[0].mobile, '3124421424');
            assert.equal(result.valid[0].landlineNumber, '312756661424');
            assert.equal(result.valid[0].postalAddress, 'Super street 2- 7');
            assert.equal(result.valid[0].city, 'Riga');
            assert.equal(result.valid[0].state, 'LA');
            assert.equal(result.valid[0].postCode, 'se6 2by');
            assert.equal(result.valid[0].country, 'USA');
            assert.equal(result.valid[0].companyName, 'Diatom Ltd.');
            assert.equal(result.valid[0].age, 18);
            assert.equal(result.valid[0].one, 1);
            assert.equal(result.valid[0].two, 2);
            assert.equal(result.valid[0].three, 3);
            done();
          }, function(error) {
            done(error);
          });
        });
      });
    });

    describe('sad path', function() {

    });
  });

});
