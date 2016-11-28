"use strict";
var assert = require('chai').assert;
var models  = require('./../../models');
var subscriptionFixture = require('./../fixtures/subscriptionPlans');
var ContactListUserService  = require('./../../services/contactListUser');
var UserService  = require('./../../services/users');
var subscriptionServices = require('./../../services/subscription');
var validAttrs = {
  accountName: "DainisL",
  firstName: "Dainis",
  lastName: "Lapins",
  password: "cool_password",
  email: "dainis@gmail.com",
  gender: "male"
}

describe('SERVICE - ContactListUser', () => {
  describe('create',  () => {

    beforeEach((done) => {
      models.sequelize.sync({force: true}).done((error, result) => {
        done();
      });
    });

    function successProvider(params) {
      return function() {
        return {
          request: function(callback) {
            callback(null, {
              subscription: { id: params.id, plan_id: 'senior_monthly' },
              customer: { id: params.id }
            });
          }
        }
      }
    }

    describe("succsess", function() {
      let TestUser = null;
      let TestAccount = null;
      let TestContactList = null;
      let TestAccountUser = null;

      beforeEach((done)=> {
        UserService.create(validAttrs, function(errors, user) {
          user.getOwnerAccount().then(function(results) {
            TestAccount = results[0]
            TestUser = user;
            TestUser.getAccountUsers().then(function(accountUsers) {
              TestAccountUser = accountUsers[0]
              TestAccount.getContactLists().then(function(CLUResults) {
                TestContactList = CLUResults[0];
                subscriptionFixture.createPlans().then(function(res) {
                  subscriptionServices.createSubscription(TestAccount.id, TestUser.id, successProvider({ id: 'SomeUniqueID' })).then(function(subscription) {
                    done();
                  }, function(error) {
                    done(error);
                  });
                }, function(error) {
                  done(error);
                })
              });
            })
          });
        });
      })
      describe("bulkCreate", ()=>{
        it("create multiple records", (done) =>  {
          let list = [{
            rowNr: 2,
            contactListId: TestContactList.id,
            defaultFields: {
              firstName: "DainisNewA",
              lastName: "LapinsNewA",
              password: "cool_password",
              email: "dainis1@gmail.com",
              gender: "male"
            },
              customFields: { one: "1", two:" 2", three:" 3" }
            },{
              rowNr: 2,
              contactListId: TestContactList.id,
              defaultFields: {
                firstName: "DainisNewB",
                lastName: "LapinsNewB",
                password: "cool_password",
                email: "dainis2@gmail.com",
                gender: "male"
              },
              customFields: { one: "3", two:" 3", three:"5" }
            }];

          ContactListUserService.bulkCreate(list, TestAccount.id).then(function(contactListUsers) {
            assert.lengthOf(contactListUsers, 2);
            done();
          }, function(err) {
            done(err);
          });
        });

        describe("failed", function() {
          let list = [];
          beforeEach((done) => {
            list = [{
              rowNr: 2,
              contactListId: TestContactList.id,
              defaultFields: {
                firstName: "DainisNewA",
                lastName: "LapinsNewA",
                password: "cool_password",
                email: "dainis1@gmail.com",
                gender: "male"
              },
                customFields: { one: "1", two:" 2", three:" 3" }
              },{
                rowNr: 4,
                contactListId: TestContactList.id,
                defaultFields: {
                  firstName: "DainisNewB",
                  lastName: "LapinsNewB",
                  password: "cool_password",
                  email: "dainis2@gmail.com",
                  gender: "male"
                },
                customFields: { one: "3", two:" 3", three:"5" }
              }];
              ContactListUserService.bulkCreate(list, TestAccount.id).then(function(contactListUsers) {
                done();
              }, function(err) {
                done(err);
              });
          });

          it("return list with errors", function(done) {
            list[0].defaultFields.email = "dainis99@gmail.com"
            ContactListUserService.bulkCreate(list, TestAccount.id).then(function(contactListUsers) {
              done("Not get here");
            }, function(error) {
              assert.equal(error[4].email, 'Email has already been taken');
              done();
            });
          })
        })
      })

      it("create to existing user base", (done) => {
        let attrs = {
          accountId: TestAccount.id,
          contactListId: TestContactList.id,
          defaultFields: {
            firstName: "DainisNew",
            lastName: "LapinsNew",
            password: "cool_password",
            email: "dainis@gmail.com",
            gender: "male"
          },
          customFields: { one: "1", two:" 2", three:" 3" }
        };

        models.ContactListUser.destroy({ where: { accountUserId: TestAccountUser.id } }).then(function() {
          ContactListUserService.create(attrs).then(function(contactListUser) {
            assert.equal(contactListUser.firstName, validAttrs.firstName);
            assert.equal(contactListUser.email, validAttrs.email);
            done()
          }, function(err) {
            done(err);
          });
        }, function(error) {
          done(error);
        });
      });

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
          models.ContactListUser.find({where: {id: contactListUser.id}}).then(function(contactListUser) {
            assert.deepEqual(contactListUser.customFields, attrs.customFields)
            assert.equal(contactListUser.accountId, attrs.accountId);
            assert.equal(contactListUser.contactListId, attrs.contactListId);
            contactListUser.getAccountUser().then(function(accountUser) {
              assert.equal(TestContactList.role, accountUser.role);
              assert.isNotNull(accountUser)
              done()
            });
          })
        }, function(err) {
          done(err);
        });
      });

      it("destroy ", (done) => {
        models.ContactListUser.find({ where: { accountUserId: TestAccountUser.id } }).then(function(contactListUser) {
          ContactListUserService.destroy([contactListUser.id], TestAccount.id).then(function() {
            TestContactList.getContactListUsers().then(function(result) {
              assert.lengthOf(result, 0)
              done();
            }, function(err) {
              done(err)
            });
          });
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

      it("update ", (done) => {
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
            customFields: { one: "1", two:"2", three:"3" }
          }

        let updateparams = {
          id: null,
          customFields: {one: 444},
          defaultFields: {firstName: "newNameUpdate"},
          accountId: TestAccount.id
        }

        ContactListUserService.create(attrs).then(function(contactListUser) {
          updateparams.id = contactListUser.id;
          ContactListUserService.update(updateparams).then(function(result) {
            assert.equal(result.firstName, updateparams.defaultFields.firstName)
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
