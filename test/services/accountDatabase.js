'use strict';

var models = require('./../../models');
var Account = models.Account;
var usersServices = require('./../../services/users');
var accountDatabaseService = require('./../../services/admin/accountDatabase');
var userFixture = require('./../fixtures/user');
var assert = require('chai').assert;
var _ = require('lodash');

describe('SERVICE - AccountDatabase', function() {
  var testUser, testAccount, testAccountUser;

  beforeEach(function(done) {
    models.sequelize.sync({ force: true }).then(() => {
      userFixture.createUserAndOwnerAccount().then(function(result) {
        testUser = result.user;
        testAccount = result.account;
        testAccountUser = result.accountUser;
        done();
      }).catch(function(error) {
        done(error);
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
      'Account Manager': 'Lauris Bligzna',
      Registered: testAccountUser.createdAt,
      'E-mail': 'bligzna.lauris@gmail.com',
      Address: '',
      City: '',
      Postcode: '',
      Country: '',
      Company: '',
      Gender: 'male',
      Mobile: '',
      Landline: '',
      'Sessions Purchased': '',
      'Tips Permission': '',
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
      'Sessions Purchased',
      'Tips Permission',
      'Active Sessions',
      'Comment'
    ];
  };

  it('Reactivates/Deactives user', function (done) {
    let params = { userId: testUser.id, accountId: testAccount.id, active: false };
    accountDatabaseService.updateAccountUser(params, {}, function(error, account) {
      assert.equal(error, null);
      assert.equal(account.AccountUsers[0].active, false);

      params.active = true;
      accountDatabaseService.updateAccountUser(params, {}, function(error, account) {
        assert.equal(error, null);
        assert.equal(account.AccountUsers[0].active, true);
        done();
      });
    });
  });

  it('Returns error on Reactivates/Deactives user', function (done) {
    let params = { userId: testUser.id + 1, accountId: testAccount.id + 1, active: false };

    accountDatabaseService.updateAccountUser(params, {},function(error, account) {
      assert.equal(account, null);
      assert.equal(error, 'Account User not found');
      done();
    });
  });

  it('add comment to user', function (done) {
    let comment = 'Test comment!!!';
    let updatedComment = 'Yeah, I just made an update to my comment';
    let params = { userId: testUser.id, accountId: testAccount.id, comment: comment };

    accountDatabaseService.updateAccountUser(params, {}, function(error, account) {
      assert.equal(error, null);
      assert.equal(account.AccountUsers[0].comment, comment);

      params.comment = updatedComment;
      accountDatabaseService.updateAccountUser(params, {}, function(error, account) {
        assert.equal(error, null);
        assert.equal(account.AccountUsers[0].comment, updatedComment);
        done();
      });
    });
  });

  it('#csvData', function (done) {
    accountDatabaseService.csvData().then(function(data) {
      let csvDataSample = csvData();
      let dataRow = data[0];
      assert.isArray(data);
      // I need to make sure we execute sync  way!!!
      let _res = _.forEach(csvHeader(), function(val, _k) {
        try {
          assert.equal(data[0][val].toString(), csvDataSample[val].toString());
        } catch (e) {
          done("CSV field: " + val + " -> " + e)
        }
      });
      done();
    }, function(err) {
      done(err)
    });
  });

  it('#csvHeader', function (done) {
    let data = accountDatabaseService.csvHeader();
    assert.deepEqual(data, csvHeader());
    done();
  });
});
