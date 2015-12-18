"use strict";
var models  = require('./../../models');
var usersServices  = require('./../../services/users');
var accountDatabase  = require('./../../services/admin/accountDatabase');
var account  = require('./../../models').Account;
var accountUser  = require('./../../models').accountUser;
var assert = require('assert');

describe('Account database', function() {

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

        account.findAll({where: {name: attrs.accountName}})
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
      assert.equal(result.active, false);
      accountDatabase.reactivateOrDeactivate(testUser.id, testAccount.id, function(error, result){
        assert.equal(error, null);
        assert.equal(result.active, true);
      });
    });
    done();
  });

   it('Returns error on Reactivates/Deactives user', function (done) { 
    let invalidTestUserId = testUser.id + 1
    let invalidTestAccountId = testAccount.id + 1

    accountDatabase.reactivateOrDeactivate(invalidTestUserId.id, invalidTestAccountId.id, function(error, result){
      assert.equal(result, null);
      assert.equal(error, "Something went wrong.");
    });
    done();
  });

  it('add comment to user', function (done) { 
    assert.equal(testUser.comment, null);

    let comment = "Test comment!!!"
    let updatedComment = "Yeah, I just made an update to my comment"
    accountDatabase.editComment(testUser.id, comment, function(error, result){
      assert.equal(error, null);
      assert.equal(result.comment, comment);
      accountDatabase.editComment(testUser.id, updatedComment, function(error, result){
        assert.equal(error, null);
        assert.equal(result.comment, updatedComment);
      });
    });
    done();
  });

  it('add comment to user returns error', function (done) { 
    let invalidTestUserId = testUser.id + 1
    let comment = "Test comment!!!"

    accountDatabase.editComment(invalidTestUserId.id, comment, function(error, result){
      assert.equal(result, null);
      assert.equal(error, "Something went wrong.");
    });
    done();
  });

  it('returns prepared data for csv export', function (done) {
    accountDatabase.getCsvJson(function (err, result) {
      assert.equal(err, null); 
      assert.equal(result[0]["Account Name"], attrs.accountName); 
      assert.equal(result[0]["Account Manager"], attrs.firstName + " " + attrs.lastName); 
      assert.equal(result[0]["email"], attrs.accountName); 
    });
    done();
  });
});
