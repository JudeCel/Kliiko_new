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

      // it.only("create to existing user base", (done) => {
      //     let attrs = {
      //       accountId: TestAccount.id,
      //       contactListId: TestContactList.id,
      //       defaultFields: {
      //         firstName: "DainisNew",
      //         lastName: "LapinsNew",
      //         password: "cool_password",
      //         email: "dainis@gmail.com",
      //         gender: "male"
      //       },
      //       customFields: { one: "1", two:" 2", three:" 3" }
      //      }
      //   ContactListUserService.create(attrs).then(function(contactListUser) {
      //     contactListUser.getAccount().then(function(result) {
      //       assert.equal(result.id, TestAccount.id);
      //       contactListUser.getUser().then(function(user) {
      //         assert.equal(user.id, TestUser.id);
      //         assert.equal(user.firstName, attrs.defaultFields.firstName);
      //         done();
      //       });
      //     });
      //   }, function(err) {
      //     done(err);
      //   });
      // });

      it("create completely new", (done) => {
          let attrs = {
            accountId: TestAccount.id,
            contactListId: TestContactList.id,
            defaultFields: {
              firstName: "DainisNew",
              lastName: "LapinsNew",
              password: "cool_password",
              email: "dainis18611@gmail.com",
              gender: "male"
            },
            customFields: { one: "1", two:" 2", three:" 3" }
           }
        ContactListUserService.create(attrs).then(function(contactListUser) {
          assert.deepEqual(contactListUser.customFields, attrs.customFields)
          assert.equal(contactListUser.accountId, attrs.accountId);
          assert.equal(contactListUser.contactListId, attrs.contactListId);
          contactListUser.getAccountUser().then(function(accountUser) {
            assert.isNotNull(accountUser)
            done()
          });
        }, function(err) {
          done(err);
        });
      });

      it("destroy ", (done) => {
          let attrs = {
            accountId: TestAccount.id,
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
          ContactListUserService.destroy([contactListUser.id], TestAccount.id).then(function() {
            TestContactList.getContactListUsers().then(function(result) {
              assert.lengthOf(result, 0)
              done()
            }, function(err) {
              done(err)
            })
          });
        }, function(err) {
          done(err);
        });
      });

      it("updatePositions ", (done) => {
          let attrs = {
            accountId: TestAccount.id,
            contactListId: TestContactList.id,
            defaultFields: {
              firstName: "DainisNew",
              lastName: "LapinsNew",
              password: "cool_password",
              email: "dainis186@gmail.com",
              gender: "male"
            }
          }
        ContactListUserService.create(attrs).then(function(contactListUser) {
          ContactListUserService.updatePositions([{id: contactListUser.id, position: 3}]).then(function(result) {
            assert.lengthOf(result, 1)
            done()
          }, function(err) {
            done(err)
          })
        }, function(err) {
          done(err);
        });
      });
    });
  });
});
