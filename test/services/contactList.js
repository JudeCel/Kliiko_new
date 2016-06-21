"use strict";
var assert = require('chai').assert;
var models  = require('./../../models');
var ContactListService  = require('./../../services/contactList');
var ContactListUserService  = require('./../../services/contactListUser');
var UserService  = require('./../../services/users');
var constants = require('./../../util/constants');
var subscriptionFixture = require('./../fixtures/subscription');
var _ = require('lodash');

describe('Services -> ContactList', () => {
  var testData;
  beforeEach(function(done) {
    subscriptionFixture.createSubscription().then(function(result) {
      testData = result;
      done();
    }, function(error) {
      done(error);
    });
  });

  afterEach(function(done) {
    models.sequelize.sync({force: true}).done((error, result) => {
      done();
    });
  });

  describe('create',  () => {
    describe("succsess", function() {
      it("createDefaultLists by default user flow", (done) => {
        testData.account.getContactLists().then(function(CLResults) {
          assert.equal(CLResults.length, 3);
          assert.equal(CLResults[0].editable, false);
          assert.sameMembers(CLResults[0].defaultFields, constants.contactListDefaultFields);
          assert.isArray(CLResults[0].customFields);
          done()
        });
      });

      it("create", (done) => {
        let attrs = {
          accountId: testData.account.id,
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
          accountId: testData.account.id,
          name: "customList",
          customFields: ["one", "two", "three"]
         }

        ContactListService.create(attrs).then(function(contactList) {
          ContactListService.destroy(contactList.id, testData.account.id).then(function(result) {
            testData.account.getContactLists().then(function(CLResults) {
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
      it("create", (done) => {
        let attrs = {
          accountId: testData.account.id,
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
    var testFileValid = { xls: 'test/fixtures/contactList/list_valid.xls', csv: 'test/fixtures/contactList/list_valid.csv' };
    var testFileInvalid = { xls: 'test/fixtures/contactList/list_invalid.xls', csv: 'test/fixtures/contactList/list_invalid.csv' };

    function defaultParams() {
      return {
        accountId: testData.account.id,
        name: 'cool list',
        customFields: ['one', 'two', 'three']
      };
    }

    describe('happy path', function() {
      describe('should succeed', function() {
        function successFunction(filePath, callback) {
          ContactListService.create(defaultParams()).then(function(contactList) {
            ContactListService.parseFile(contactList.id, filePath).then(function(result) {
              assert.lengthOf(result.valid, 3);
              assert.lengthOf(result.invalid, 1)
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
          ContactListService.create(defaultParams()).then(function(contactList) {
            ContactListService.parseFile(contactList.id, filePath).then(function(result) {
              assert.equal(result.valid.length, 5);
              assert.equal(result.invalid.length, 1);
              callback(null, true);
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

      describe('should fail because field - firstName is not found', function() {
        function failureFunction(filePath, callback) {
          ContactListService.create(defaultParams()).then(function(contactList) {
            ContactListService.parseFile(contactList.id, filePath).then(function(result) {
              assert.equal(result.invalid[0].validationErrors.firstName, 'Required');
              callback(null, true);
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
      var testFileValid = { xls: 'test/fixtures/contactList/list_valid_v2.xls', csv: 'test/fixtures/contactList/list_invalid.csv' };
        function failureFunction(filePath, callback) {
          ContactListService.create(defaultParams()).then(function(contactList) {
            ContactListService.parseFile(contactList.id, filePath).then(function(result) {
              assert.include(result.duplicateEntries[0].rows, 3);
              assert.include(result.duplicateEntries[0].rows, 6);
              assert.lengthOf(result.duplicateEntries, 2);
              assert.equal(result.duplicateEntries[0].email, "chatUser@insider.com");
              assert.equal(result.duplicateEntries[1].email, "bligzna.lauris@gmail.com");
              callback(null, true);
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

      describe('should fail because missing fields: firstName, lastName, gender, email', function() {
        function failureFunction(filePath, callback) {
          ContactListService.create(defaultParams()).then(function(contactList) {
            ContactListService.parseFile(contactList.id, filePath).then(function(result) {
              assert.equal(result.invalid[0].validationErrors.firstName, 'Required');
              assert.equal(result.invalid[0].validationErrors.lastName, 'Required');
              assert.equal(result.invalid[0].validationErrors.gender, 'Required');
              assert.equal(result.invalid[0].validationErrors.email, 'Required');

              callback(null, true);
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

      describe('should fail because of missing gender data', function() {
        function failureFunction(filePath, callback) {
          ContactListService.create(defaultParams()).then(function(contactList) {
            ContactListService.parseFile(contactList.id, filePath).then(function(result) {
              assert.equal(result.invalid[0].validationErrors.gender, 'Required');
              callback(null, true);
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
          ContactListService.create(defaultParams()).then(function(contactList) {
            let attrs = {
              userId: testData.user.id,
              accountId: testData.account.id,
              contactListId: contactList.id,
              defaultFields: {
                firstName: "DainisNew",
                lastName: "LapinsNew",
                password: "cool_password",
                email: "bligzna.lauris@gmail.com",
                gender: "male"
              },
              customFields: { one: "1", two:" 2", three:" 3" }
            }

            ContactListUserService.create(attrs).then(function(contactListUser) {
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
});
