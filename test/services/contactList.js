"use strict";
var assert = require('chai').assert;
var models  = require('./../../models');
var ContactListService  = require('./../../services/contactList');
var ContactListUserService  = require('./../../services/contactListUser');
var UserService  = require('./../../services/users');
var constants = require('./../../util/constants');
var subscriptionFixture = require('./../fixtures/subscription');
var MessagesUtil = require('./../../util/messages');
var _ = require('lodash');

describe.only('Services -> ContactList', () => {
  var testData;
  beforeEach(function(done) {
    models.sequelize.sync({force: true}).done((error, result) => {
      subscriptionFixture.createSubscription().then(function(result) {
        testData = result;
        done();
      }, function(error) {
        done(error);
      });
    });
  });

  function contactListParams(name) {
    return {
      accountId: testData.account.id,
      name: name || "test list",
      customFields: ["one", "two", "three"]
    };
  }

  function contactListUserParams(contactListId) {
    return {
      userId: testData.user.id,
      accountId: testData.account.id,
      contactListId: contactListId,
      defaultFields: {
        firstName: "DainisNew",
        lastName: "LapinsNew",
        password: "cool_password",
        email: "bligzna.lauris@gmail.com",
        gender: "male"
      },
      customFields: { one: "1", two:" 2", three:" 3" }
    };
  }

  describe('create',  () => {
    describe("succsess", function() {
      it("createDefaultLists by default user flow", (done) => {
        testData.account.getContactLists().then(function(CLResults) {
          try {
            assert.equal(CLResults.length, 3);
            assert.equal(CLResults[0].editable, false);
            assert.sameMembers(CLResults[0].defaultFields, constants.contactListDefaultFields);
            assert.isArray(CLResults[0].customFields);
            done();
          } catch (e) {
            done(e);
          }
        });
      });

      it("create", (done) => {
        let attrs = contactListParams();

        ContactListService.create(attrs).then(function(contactList) {
          assert.equal(contactList.active, true)
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
        let attrs = contactListParams();

        ContactListService.create(attrs).then((contactList) => {
          ContactListService.destroy(contactList.id, testData.account.id).then((result)  =>{
            testData.account.getContactLists().then((CLResults) => {
              assert.equal(CLResults.length, 3);
              done();
            }, (err) => {
              done(err);
            })
          }, (err) => {
            done(err);
          })
        }, (err) => {
          done(err);
        });
      })
    });

    describe("failed", function() {
      it("create", (done) => {
        let attrs = contactListParams("Hosts");

        ContactListService.create(attrs).then(function(_contactList) {
          done("should not get there!!");
        }, function(err) {
          assert.isObject(err)
          done();
        });
      });
    });
  });

  describe("#deactivateList", () => {
    it("can deactivate ", (done) => {
      let attrs = contactListParams();
      ContactListService.create(attrs).then((contactList) => {
        ContactListService.deactivateList(contactList.id, testData.account.id).then((deactivateContactList) => {
          try {
            assert.equal(deactivateContactList.active, false)
            done();
          } catch (error) {
            done(error);
          }
        }, (error) => {
          done(error);
        })
      }, (error) => {
        done(error);
      });
    });

    it("can't deactivate default list ", (done) => {
      testData.account.getContactLists().then(function(CLResults) {
        ContactListService.deactivateList(CLResults[0], testData.account.id).then(() => {
          done("Should not get here!!!");
        }, (error) => {
          done();
        });
      }, (error) => {
        try {
          assert.equal(error, MessagesUtil.contactList.notFound)
          done();
        } catch (e) {
          done(e);
        }
      })
    });
  });

  describe("#activateList", () => {
    it("can activateList ", (done) => {
      let attrs = contactListParams();
      ContactListService.create(attrs).then((contactList) => {
        ContactListService.deactivateList(contactList.id, testData.account.id).then((deactivateContactList) => {
          ContactListService.activateList(deactivateContactList.id, testData.account.id).then((activeList) => {
            try {
              assert.equal(activeList.active, true)
              done();
            } catch (error) {
              done(error);
            }
          }, (error) => {
            done(error);
          })
        }, (error) => {
          done(error);
        })
      }, (error) => {
        done(error);
      });
    });
  });

  describe('#parseFile', function() {
    var testFileValid = { xls: 'test/fixtures/contactList/list_valid.xls', csv: 'test/fixtures/contactList/list_valid.csv' };
    var testFileInvalid = { xls: 'test/fixtures/contactList/list_invalid.xls', csv: 'test/fixtures/contactList/list_invalid.csv' };

    describe('happy path', function() {
      describe('should succeed', function() {
        function successFunction(filePath, callback) {
          ContactListService.create(contactListParams()).then(function(contactList) {
            ContactListService.parseFile(contactList.id, filePath).then(function(result) {
              try {
                assert.lengthOf(result.valid, 3);
                assert.lengthOf(result.invalid, 0)
                assert.ok(_.isEqual(result.contactListFields.defaultFields, contactList.defaultFields));
                assert.ok(_.isEqual(result.contactListFields.customFields, contactList.customFields));
                assert.equal(result.valid[0].firstName, 'user');
                assert.equal(result.valid[0].lastName, 'insider user');
                assert.equal(result.valid[0].gender, 'male');
                assert.equal(result.valid[0].email, 'user@insider.com');
                assert.equal(result.valid[0].mobile, '+61 3124421424');
                assert.equal(result.valid[0].landlineNumber, '+61 312756661424');
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
                callback(null, true);
              } catch (e) {
                callback(e);
              }
            }, function(error) {
              callback(error);
            });
          }, function(error) {
            callback(error);
          });
        }

        it('#parseCsv', function(done) {
          successFunction(testFileValid.csv, function(error) {
            done(error);
          });
        });

        it('#parseXls', function(done) {
          successFunction(testFileValid.xls, function(error) {
            done(error);
          });
        });
      });
    });

    describe('sad path', function() {
      describe('should fail partially', function() {
        function failureFunction(filePath, callback) {
          ContactListService.create(contactListParams()).then(function(contactList) {
            ContactListService.parseFile(contactList.id, filePath).then(function(result) {
              try {
                assert.equal(result.valid.length, 3);
                assert.equal(result.invalid.length, 3);
                callback(null, true);
              } catch (e) {
                callback(e);
              }
            }, function(error) {
              callback(error);
            });
          });
        }

        it('#parseCsv', function(done) {
          failureFunction(testFileInvalid.csv, function(error) {
            done(error);
          });
        });

        it('#parseXls', function(done) {
          failureFunction(testFileInvalid.xls, function(error) {
            done(error);
          });
        });
      });

      describe('should fail because field - lastName is not found', function() {
        function failureFunction(filePath, callback) {
          ContactListService.create(contactListParams()).then(function(contactList) {
            ContactListService.parseFile(contactList.id, filePath).then(function(result) {
              try {
                assert.equal(result.invalid[2].validationErrors.lastName, 'Required');
                callback(null, true);
              } catch (e) {
                callback(e);
              }
            }, function(error) {
              callback(error);
            });
          });
        }

        it('#parseCsv', function(done) {
          failureFunction(testFileInvalid.csv, function(error) {
            done(error);
          });
        });

        it('#parseXls', function(done) {
          failureFunction(testFileInvalid.xls, function(error) {
            done(error);
          });
        });
      });

    describe('should fail because duplicate email in file', function() {
      var testFileValid = { xls: 'test/fixtures/contactList/list_invalid.xls', csv: 'test/fixtures/contactList/list_invalid.csv' };
        function failureFunction(filePath, callback) {
          ContactListService.create(contactListParams()).then(function(contactList) {
            ContactListService.parseFile(contactList.id, filePath).then(function(result) {
              try {
                assert.include(result.duplicateEntries[0].rows, 5);
                assert.include(result.duplicateEntries[0].rows, 3);
                assert.lengthOf(result.duplicateEntries, 2);
                assert.equal(result.duplicateEntries[0].email, "chatUser@insider.com");
                assert.equal(result.duplicateEntries[1].email, "bligzna.lauris@gmail.com");
                callback(null, true);
              } catch (e) {
                callback(e);
              }
            }, function(error) {
              callback(error);
            });
          });
        }

        it('#parseCsv', function(done) {
          failureFunction(testFileInvalid.csv, function(error) {
            done(error);
          });
        });

        it('#parseXls', function(done) {
          failureFunction(testFileInvalid.xls, function(error) {
            done(error);
          });
        });
      });

      describe('should fail because missing fields: firstName, lastName, email', function() {
        function failureFunction(filePath, callback) {
          ContactListService.create(contactListParams()).then(function(contactList) {
            ContactListService.parseFile(contactList.id, filePath).then(function(result) {
              try {
                assert.equal(result.invalid[2].validationErrors.firstName, 'Required');
                assert.equal(result.invalid[2].validationErrors.lastName, 'Required');
                assert.equal(result.invalid[2].validationErrors.email, 'Required');
                callback(null, true);
              } catch (e) {
                callback(e);
              }
            }, function(error) {
              callback(error);
            });
          });
        }

        it('#parseCsv', function(done) {
          failureFunction(testFileInvalid.csv, function(error) {
            done(error);
          });
        });

        it('#parseXls', function(done) {
          failureFunction(testFileInvalid.xls, function(error) {
            done(error);
          });
        });
      });

      describe('should fail because of email already in use', function() {
        function failureFunction(filePath, callback) {
          ContactListService.create(contactListParams()).then(function(contactList) {
            ContactListUserService.create(contactListUserParams(contactList.id)).then(function(contactListUser) {
              ContactListService.parseFile(contactList.id, filePath).then(function(result) {
                assert.equal(result.invalid[2].validationErrors.email, 'Email already taken');
                callback(null, true);
              }, function(error) {
                callback(error);
              });
            });
          });
        }

        it('#parseCsv', function(done) {
          failureFunction(testFileInvalid.csv, function(error) {
            done(error);
          });
        });

        it('#parseXls', function(done) {
          failureFunction(testFileInvalid.xls, function(error) {
            done(error);
          });
        });
      });

    });
  });

  describe('#exportContactList', function() {

    describe('happy path', function() {
      it('should succeed on exporting contact list', function (done) {
        ContactListService.create(contactListParams()).then(function(contactList) {
          let userParams = contactListUserParams(contactList.id);
          ContactListUserService.create(userParams).then(function(contactListUser) {
            models.SubscriptionPreference.update({'data.exportContactListAndParticipantHistory': true}, { where: { subscriptionId: testData.subscription.id } }).then(function() {
              ContactListService.exportContactList({ id: contactList.id }, testData.account).then(function(result) {
                let validResult = {
                  header: [ 'First Name', 'Last Name', 'Gender', 'Email', 'Postal Address', 'City', 'State', 'Country', 'Post Code', 'Company Name', 'Landline Number',
                    'Mobile', 'one', 'two', 'three', 'Invites', 'Accept', 'Not This Time', 'Not At All', 'No Reply', 'Future', 'Last Session' ],
                  data: [ { 'First Name': 'Lauris', 'Last Name': 'Bligzna', Gender: 'male', Email: 'bligzna.lauris@gmail.com', 'Postal Address': null,
                    City: null, State: null, Country: null, 'Post Code': null, 'Company Name': null, 'Landline Number': '', Mobile: '',
                    one: '1', two: ' 2', three: ' 3', Invites: 0, Accept: 0, 'Not This Time': 0, 'Not At All': 0, 'No Reply': 0, Future: '-', 'Last Session': '-' } ]
                };
                assert.deepEqual(result, validResult);
                done();
              }, function(err) {
                done(err);
              });
            }, function(err) {
              done(err);
            });
          }, function(err) {
            done(err);
          });
        }, function(err) {
          done(err);
        });
      });
    });

    describe('sad path', function() {
      
      it('should fail on subscription validation', function (done) {
        ContactListService.create(contactListParams()).then(function(contactList) {
          ContactListService.exportContactList({ id: contactList.id + 100 }, testData.account).then(function(result) {
            done('Should not get here!');
          }, function(error) {
            try {
            assert.equal(error.message, MessagesUtil.validators.subscription.error.exportContactListAndParticipantHistory);
            done();
            } catch (e) {
              done(e);
            }
          });
        }, function(err) {
          done(err);
        });
      });

      it('should fail on finding contact list', function (done) {
        ContactListService.create(contactListParams()).then(function(contactList) {
          models.SubscriptionPreference.update({'data.exportContactListAndParticipantHistory': true}, { where: { subscriptionId: testData.subscription.id } }).then(function() {
            ContactListService.exportContactList({ id: contactList.id + 100 }, testData.account).then(function(result) {
              done('Should not get here!');
            }, function(error) {
              assert.equal(error, MessagesUtil.contactList.notFound);
              done();
            });
          }, function(err) {
            done(err);
          });
        }, function(err) {
          done(err);
        });
      });
    });

  });

});
