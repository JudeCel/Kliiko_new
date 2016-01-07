'use strict';

var models = require('./../../models');
var usersServices = require('./../../services/users');
var accountDatabaseService = require('./../../services/admin/accountDatabase');
var Account = require('./../../models').Account;
var assert = require('chai').assert;

describe('SERVICE - AccountDatabase', function() {
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
        user.getOwnerAccount().then(function(accounts) {
          testAccount = accounts[0];
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

  function csvData() {
    return {
      'Account Name': 'BLauris',
      'Account Manager': 'Lauris Blīgzna',
      Registered: testUser.createdAt,
      'E-mail': 'bligzna.lauris@gmail.com',
      Address: '',
      City: '',
      Postcode: '',
      Country: '',
      Company: '',
      Gender: 'male',
      Mobile: '',
      Landline: '',
      'Sessions purchased': '',
      'Type permission': '',
      'Active Sessions': '',
      Comment: ''
    };
  };

  function csvHeader() {
    return [
      'Account Name',
      'Account Manager',
      'Registered',
      'E-mail',
      'Address',
      'City',
      'Postcode',
      'Country',
      'Company',
      'Gender',
      'Mobile',
      'Landline',
      'Sessions purchased',
      'Type permission',
      'Active Sessions',
      'Comment'
    ];
  };

  it('Reactivates/Deactives user', function (done) {
    let params = { userId: testUser.id, accountId: testAccount.id, active: false };
    accountDatabaseService.updateAccountUser(params, function(error, account) {
      assert.equal(error, null);
      assert.equal(account.AccountUsers[0].active, false);

      params.active = true;
      accountDatabaseService.updateAccountUser(params, function(error, account) {
        assert.equal(error, null);
        assert.equal(account.AccountUsers[0].active, true);
        done();
      });
    });
  });

  it('Returns error on Reactivates/Deactives user', function (done) {
    let params = { userId: testUser.id + 1, accountId: testAccount.id + 1, active: false };

    accountDatabaseService.updateAccountUser(params, function(error, account) {
      assert.equal(account, null);
      assert.equal(error, 'There is no AccountUser with userId: ' + params.userId + ' and accountId: ' + params.accountId);
      done();
    });
  });

  it('add comment to user', function (done) {
    let comment = 'Test comment!!!';
    let updatedComment = 'Yeah, I just made an update to my comment';
    let params = { userId: testUser.id, accountId: testAccount.id, comment: comment };

    accountDatabaseService.updateAccountUser(params, function(error, account) {
      assert.equal(error, null);
      assert.equal(account.AccountUsers[0].comment, comment);

      params.comment = updatedComment;
      accountDatabaseService.updateAccountUser(params, function(error, account) {
        assert.equal(error, null);
        assert.equal(account.AccountUsers[0].comment, updatedComment);
        done();
      });
    });
  });

  it('#csvData', function (done) {
    accountDatabaseService.csvData(function(error, data) {
      assert.equal(error, null);
      assert.deepEqual(data[0], csvData());
      done();
    });
  });

  it('#csvHeader', function (done) {
    let data = accountDatabaseService.csvHeader();
    assert.deepEqual(data, csvHeader());
    done();
  });
});
