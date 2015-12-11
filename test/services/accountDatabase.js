"use strict";
var models  = require('./../../models');
var usersServices  = require('./../../services/users');
var accountDatabase  = require('./../../services/admin/accountDatabase');
var Account  = require('./../../models').Account;
var assert = require('assert');

describe('Change Password', function() {

  var testUser = null;
  var testAccount = null;

  beforeEach(function(done) {
    var attrs = {
      accountName: "BLauris",
      firstName: "Lauris",
      lastName: "Blīgzna",
      password: "multipassword",
      email: "bligzna.lauris@gmail.com",
      gender: "male"
    }

    models.sequelize.sync({ force: true }).then(() => {
      usersServices.create(attrs, function(errors, user) {
        testUser = user;

        Account.findAll({where: {name: attrs.accountName}})
        .then(function (result) {
          testAccount = result[0];
          done();
        });
      });
    });
  });

  afterEach(function(done) {
    models.sequelize.sync({ force: true }).then(() => {
      done();
    });
  });

  it('Reactivates/Deactives user', function (done) { 
    accountDatabase.reactivateOrDeactivate(testUser.id, testAccount.id, function(error, result){
      assert.equal(error, null);
    });
    done();
  });

  // it('add comment to user', function (done) { 
  //   assert.equal(testUser.comment, null);

  //   let comment = "Test comment!!!"
  //   accountDatabase.editComment(testUser.id, comment, function(error, result){
  //     assert.equal(error, null);
  //     assert.equal(testUser.comment, comment);
  //     console.log(result);
  //   });
  //   done();
  // });

  // it('returns prepared data for csv export', function (done) {
  //   accountDatabase.getCsvJson(function (err, result) {
  //     assert.equal(err, null); 
  //     assert.equal(result[0]["Account Name"], attrs.accountName); 
  //     assert.equal(result[0]["Account Manager"], attrs.firstName + " " + attrs.lastName); 
  //     assert.equal(result[0]["email"], attrs.accountName); 
  //   });
  //   done();
  // });

});
