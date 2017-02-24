'use strict';

var models = require('./../../models');
var MessagesUtil = require('./../../util/messages');
var {Account, ContactList, ContactListUser, Invite} = models;
var usersServices = require('./../../services/users');
var accountDatabaseService = require('./../../services/admin/accountDatabase');
var userFixture = require('./../fixtures/user');
var subscriptionFixture = require('./../fixtures/subscription');
var assert = require('chai').assert;
var _ = require('lodash');
var testDatabase = require("../database");

describe('SERVICE - AccountDatabase', () => {
  var testUser, testAccount, testAccountUser;

  beforeEach((done) => {
    testDatabase.prepareDatabaseForTests().then(() => {
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

  describe("#addAdmin", () =>{
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

    describe('description', function () {
      var adminUser;
      beforeEach((done) => {
        let adminParams = {
          firstName: "firstName",
          lastName: 'lastName',
          gender: '',
          email: 'admin@admin.lv',
          role: 'admin',
          password: "rrrrrrrrrrr"
        }
        userFixture.createAdminUser(adminParams)
          .then((user) => {
            adminUser = user;
            done();
          }).catch((error) => done(error));
      });

      it("give admin email", (done) => {
        let params = {email: adminUser.email, accountId: testAccount.id}
        accountDatabaseService.addAdmin(params, testAccount.id).then((adminAccoutUser) => {
          ContactListUser.find({where: {userId: adminAccoutUser.UserId, accountId: testAccount.id},
            include: [{model: ContactList}]
          }).then((contactListUser) => {
            Invite.find({where: {accountUserId: contactListUser.accountUserId, role: 'admin'}}).then((invite) => {
              try {
                assert.equal(contactListUser.ContactList.role, 'accountManager');
                assert.isObject(invite);
                assert.isObject(adminAccoutUser);
                done();
              } catch (error) {
                done(error);
              }
            })
          });
        }, (error) => {
          done(error);
        })
      })

      it("reactivate admin account for this user", (done) => {
        let params = { email: adminUser.email, accountId: testAccount.id }
        accountDatabaseService.addAdmin(params, testAccount.id).then((adminAccoutUser) => {
          return accountDatabaseService.removeAdmin(params);
        }).then((account) => {
          assert.equal(account.dataValues.hasActiveAdmin, false);
          account.AccountUsers.map((accountUser) => {
            assert.equal(accountUser.active, accountUser.role !== 'admin');
            assert.equal(accountUser.isRemoved, accountUser.role === "admin");
          });

          return accountDatabaseService.addAdmin(params, account.dataValues.id);
        }).then((accountUser) => {
          assert.equal(accountUser.role, 'admin');
          assert.equal(accountUser.isRemoved, false)
          assert.equal(accountUser.active, false);
          done();
        }).catch((error) => done(error));
      })
    });
  });

  describe("#removeAdmin", () =>{
    it("remove given admin", (done) => {
      let adminParams = {
        firstName: "firstName",
        lastName: 'lastName',
        gender: '',
        email: 'admin@admin.lv',
        role: 'admin',
        password: "rrrrrrrrrrr"
      }
      let id, params = {};

      userFixture.createAdminUser(adminParams).then((adminUser) => {
        params = { email: adminUser.email, accountId: testAccount.id };
        return accountDatabaseService.addAdmin(params);
      }).then((adminAccoutUser) => {
        id = adminAccoutUser.id;
        assert.equal(adminAccoutUser.role, 'admin');

        return accountDatabaseService.removeAdmin(params);
      }).then((account) => {
        assert.equal(account.dataValues.hasActiveAdmin, false);
        account.AccountUsers.map((accountUser) => {
          assert.equal(accountUser.active, accountUser.role !== 'admin');
        });

        done();
      }).catch((error) => done(error));
    })
  });

  describe("Reactivates/Deactives", () => {
    it('user',  (done) => {
      let params = { 
        userId: testUser.id, 
        accountId: testAccount.id, 
        accountUserId: testAccount.AccountUser.id, 
        active: false 
      };

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
      let params = { 
        userId: testUser.id + 1, 
        accountId: testAccount.id + 1, 
        accountUserId: testAccount.AccountUser.id, 
        active: false 
      };

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
