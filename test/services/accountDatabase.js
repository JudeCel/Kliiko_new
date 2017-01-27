'use strict';

var models = require('./../../models');
var MessagesUtil = require('./../../util/messages');
var Account = models.Account;
var usersServices = require('./../../services/users');
var accountDatabaseService = require('./../../services/admin/accountDatabase');
var userFixture = require('./../fixtures/user');
var subscriptionFixture = require('./../fixtures/subscription');
var assert = require('chai').assert;
var _ = require('lodash');

describe('SERVICE - AccountDatabase', () => {
  var testUser, testAccount, testAccountUser;

  beforeEach((done) => {
    models.sequelize.sync({ force: true }).then(() => {
      userFixture.createUserAndOwnerAccount().then((result) => {
        testUser = result.user;
        testAccount = result.account;
        testAccountUser = result.accountUser;
        subscriptionFixture.createSubscription(testAccount.id, testUser.id).then(() => {
          done();
        })
      }).catch((error) => {
        done(error);
      });
    });
  });

  describe.only("#addAdmin", () =>{
    it("when not admin email", (done) => {
      let params = {email: testAccountUser.email}
      accountDatabaseService.addAdmin(params,testAccount.id).then(() => {
        done("should not get here!!!");
      }, (error) => {
        try {
          assert.equal((MessagesUtil.accountDatabase.adminNotFound  + testAccountUser.email), error)
          done();
        } catch (error) {
          done(error);
          
        }
      })
    });
    
    it("gived admin email", (done) => {
      let adminParams = {
        firstName: "firstName",
        lastName: 'lastName',
        gender: '',
        email: 'admin@admin.lv',
        role: 'admin',
        password: "rrrrrrrrrrr"
      }

      userFixture.createAdminUser(adminParams).then((adminUser) => {
        let params = {email: adminUser.email, accountId: testAccount.id}
        accountDatabaseService.addAdmin(params,testAccount.id).then(() => {
          done();
        }, (error) => {
          done(error);
        })
      }, (error) => {
        done(error);
      })
    })
  });

  describe("Reactivates/Deactives", () => {
    it('user',  (done) => {
      let params = { userId: testUser.id, accountId: testAccount.id, active: false };
      accountDatabaseService.updateAccountUser(params, {}, (error, account) => {
        assert.equal(error, null);
        assert.equal(account.AccountUsers[0].active, false);

        params.active = true;
        accountDatabaseService.updateAccountUser(params, {}, (error, account) => {
          assert.equal(error, null);
          assert.equal(account.AccountUsers[0].active, true);
          done();
        });
      });
    });

    it('Returns error on user', (done) => {
      let params = { userId: testUser.id + 1, accountId: testAccount.id + 1, active: false };

      accountDatabaseService.updateAccountUser(params, {}, (error, account) => {
        assert.equal(account, null);
        assert.equal(error, 'Account User not found');
        done();
      });
    });
  })


  it('add comment to user', (done) =>{
    let comment = 'Test comment!!!';
    let updatedComment = 'Yeah, I just made an update to my comment';
    let params = { userId: testUser.id, accountId: testAccount.id, comment: comment };

    accountDatabaseService.updateAccountUser(params, {}, (error, account) => {
      assert.equal(error, null);
      assert.equal(account.AccountUsers[0].comment, comment);

      params.comment = updatedComment;
      accountDatabaseService.updateAccountUser(params, {}, (error, account) => {
        assert.equal(error, null);
        assert.equal(account.AccountUsers[0].comment, updatedComment);
        done();
      });
    });
  });

  describe("export", () => {
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

    it('#csvData', (done) => {
      accountDatabaseService.csvData().then((data) => {
        let csvDataSample = csvData();
        let dataRow = data[0];
        assert.isArray(data);
          try {
            assert.deepEqual(data[0],csvDataSample);
            done()

          } catch (e) {
            done(e)

          }
      }, (err) => {
        done(err)
      });
    });

    it('#csvHeader',  (done) => {
      let csvHeader = [
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

      let data = accountDatabaseService.csvHeader();
      assert.deepEqual(data, csvHeader);
      done();
    });
  })
});
