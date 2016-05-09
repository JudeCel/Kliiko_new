'use strict';

var models = require('./../../models');
var Invite = models.Invite;
var User = models.User;
var Account = models.Account;
var AccountUser = models.AccountUser;

var userService = require('./../../services/users');
var inviteService = require('./../../services/invite');
var accountManagerService = require('./../../services/accountManager');
var userFixture = require('./../fixtures/user');

var assert = require('chai').assert;
var async = require('async');

var testData;

describe('SERVICE - AccountManager', function() {
  beforeEach(function(done) {
    userFixture.createUserAndOwnerAccount().then(function(result) {
      testData = result;
      done();
    }).catch(function(error) {
      done(error);
    });
  });

  afterEach(function(done) {
    models.sequelize.sync({ force: true }).then(function() {
      done();
    });
  });

  function countTables(params) {
    return [
      function(cb) {
        Invite.count().then(function(c) {
          assert.equal(c, params.invite);
          cb();
        });
      },
      function(cb) {
        Account.count().then(function(c) {
          assert.equal(c, params.account);
          cb();
        });
      },
      function(cb) {
        User.count().then(function(c) {
          assert.equal(c, params.user);
          cb();
        });
      },
      function(cb) {
        AccountUser.count().then(function(c) {
          assert.equal(c, params.accountUser);
          cb();
        });
      }
    ];
  }

  function sampleData(params) {
    let newParams = params || {};

    return {
      accountId: testData.account.id,
      role: 'accountManager',
      user: { id: testData.user.id, email: testData.user.email },
      body: {
        firstName: 'FirstName',
        lastName: 'LastName',
        gender: 'male',
        email: 'some@email.com'
      }
    }
  }

  describe('#createOrFindAccountManager', function() {
    describe('happy path', function() {
      it('should create new user', function(done) {
        let data = sampleData();

        accountManagerService.createOrFindAccountManager(data.user, data.body, data.accountId).then(function(params) {
          AccountUser.find({ where: { email: data.body.email } }).then(function(accountUser) {
            let returnParams = {
              userId: accountUser.UserId,
              accountUserId: accountUser.id,
              accountId: data.accountId,
              userType: 'new',
              role: accountUser.role
            };

            assert.deepEqual(params, returnParams);
            done();
          });
        }, function(error) {
          done(error);
        });
      });
    });

    describe('sad path', function() {
      it('should fail because of inviting himself', function (done) {
        let data = sampleData();
        data.user.email = data.body.email;

        accountManagerService.createOrFindAccountManager(data.user, data.body, data.accountId).then(function(params) {
          done('Should not get here!');
        }, function(error) {
          assert.deepEqual(error, { email: 'You are trying to invite yourself.' });
          done();
        });
      });

      it('should fail because of already accepted', function (done) {
        let data = sampleData();
        data.user.id = testData.user.id + 99;
        data.user.email = 'other@mail.com';
        data.body.email = testData.user.email;

        accountManagerService.createOrFindAccountManager(data.user, data.body, data.accountId).then(function(params) {
          done('Should not get here!');
        }, function(error) {
          assert.deepEqual(error.email, "This user is already invited.");
          done();
        });
      });
    });
  });

  describe('#findAccountManagers', function() {
    it('should find accepted user', function (done) {
      let data = sampleData();

      accountManagerService.createOrFindAccountManager(data.user, data.body, data.accountId).then(function(params) {
        inviteService.createInvite(params).then(function(result) {
          let userParams = { accountName: 'newname', password: 'newpassword' };
          inviteService.acceptInviteNew(result.invite.token, userParams, function(error, message) {
            if(error) {
              done(error);
            }

            async.parallel(countTables({ invite: 1, account: 1, user: 2, accountUser: 2 }), function(error, result) {
              if(error) {
                done(error);
              }
              accountManagerService.findAccountManagers(data.accountId).then(function(results) {
                let subject = results[0];
                assert.equal(subject.status, 'active');
                assert.equal(subject.AccountId, data.accountId);
                done();
              }, function(error) {
                done(error);
              });
            });
          });
        });
      }, function(error) {
        done(error);
      });
    });

    it('should find invited user', function (done) {
      let data = sampleData();

      accountManagerService.createOrFindAccountManager(data.user, data.body, data.accountId).then(function(params) {
        inviteService.createInvite(params).then(function(result) {
          async.parallel(countTables({ invite: 1, account: 1, user: 2, accountUser: 2 }), function(error, result) {
            if(error) {
              done(error);
            }

            accountManagerService.findAccountManagers(data.accountId).then(function(result) {
              let subject = result[1];
              assert.equal(subject.status, 'invited');
              assert.equal(subject.AccountId, data.accountId);
              done();
            }, function(error) {
              done(error);
            });
          });
        }, function(error) {
          done(error);
        });
      }, function(error) {
        done(error);
      });
    });
  });

  describe('#findAndRemoveAccountUser', function() {
    it('should remove account from list', function (done) {
      let data = sampleData();

      accountManagerService.createOrFindAccountManager(data.user, data.body, data.accountId).then(function(params) {
        AccountUser.find({ where: { email: data.body.email } }).then(function(accountUser) {
          inviteService.createInvite(params).then(function(result) {
            let userParams = { accountName: 'newname', password: 'newpassword' };
            inviteService.acceptInviteNew(result.invite.token, userParams, function(error, message) {
              if(error) {
                done(error);
              }

              async.parallel(countTables({ invite: 1, account: 1, user: 2, accountUser: 2 }), function(error, result) {
                if(error) {
                  done(error);
                }

                accountManagerService.findAndRemoveAccountUser(accountUser.id, data.accountId).then(function(message) {
                  assert.equal(message, 'Successfully removed account from Account List');

                  async.parallel(countTables({ invite: 0, account: 1, user: 2, accountUser: 1 }), function(error, result) {
                    done(error);
                  });
                }, function(error) {
                  done(error);
                });
              });
            });
          });
        });
      }, function(error) {
        done(error);
      });
    });
  });
});
