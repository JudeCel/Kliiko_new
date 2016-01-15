"use strict";
var assert = require('chai').assert;
var models  = require('./../../models');
var ContactListUserService  = require('./../../services/contactListUser');
var UserService  = require('./../../services/users');

describe('Services -> ContactListUser', () => {
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
      let TestContactList = null;

      beforeEach((done)=> {
        UserService.create(validAttrs, function(errors, user) {
          user.getOwnerAccount().then(function(results) {
            TestAccount = results[0]
            TestUser = user;
            TestAccount.getContactLists().then(function(CLUResults) {
              TestContactList = CLUResults[0];
              done();
            })
          });
        });
      })

      it("create to existing user base", (done) => {
          let attrs = {
            accountId: TestAccount.id,
            userId: TestUser.id,
            contactListId: TestContactList.id,
            defaultFields: {
              firstName: "DainisNew",
              lastName: "LapinsNew",
              password: "cool_password",
              email: "dainis@gmail.com",
              gender: "male"
            },
            customFields: { one: "1", two:" 2", three:" 3" }
           }
        ContactListUserService.create(attrs).then(function(contactListUser) {
          contactListUser.getAccount().then(function(result) {
            assert.equal(result.id, TestAccount.id);
            contactListUser.getUser().then(function(user) {
              assert.equal(user.id, TestUser.id);
              assert.equal(user.firstName, attrs.defaultFields.firstName);
              done();
            });
          });
        }, function(err) {
          done(err);
        });
      });

      it("create completely new", (done) => {
          let attrs = {
            accountId: TestAccount.id,
            userId: TestUser.id,
            contactListId: TestContactList.id,
            defaultFields: {
              firstName: "DainisNew",
              lastName: "LapinsNew",
              password: "cool_password",
              email: "dainis186@gmail.com",
              gender: "male"
            },
            customFields: { one: "1", two:" 2", three:" 3" }
           }
        ContactListUserService.create(attrs).then(function(contactListUser) {
          contactListUser.getAccount().then(function(result) {
            assert.equal(result.id, TestAccount.id);
            contactListUser.getUser().then(function(user) {
              assert.equal(user.id, 2);
              assert.equal(user.firstName, attrs.defaultFields.firstName);
              assert.equal(user.email, attrs.defaultFields.email);
              done();
            });
          });
        }, function(err) {
          done(err);
        });
      });
    });
  });
});
