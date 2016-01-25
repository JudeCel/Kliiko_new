'use strict';

var models = require('./../../models');
var Invite = models.Invite;
var User = models.User;
var Account = models.Account;
var AccountUser = models.AccountUser;

var userService = require('./../../services/users');
var inviteService = require('./../../services/invite');
var accountManagerService = require('./../../services/accountManager');

var assert = require('chai').assert;
var async = require('async');

var testUser = null, testAccountUser = null, testAccount = null;

describe('SERVICE - AccountManager', function() {
  beforeEach(function(done) {
    let attrs = {
      accountName: "Lilo",
      firstName: "Lilu",
      lastName: "Dalas",
      password: "multipassword",
      email: "lilu.tanya@gmail.com",
      gender: "male"
    };

    models.sequelize.sync({ force: true }).then(() => {
      userService.create(attrs, function(err, user) {
        testUser = user;
        user.getOwnerAccount().then(function(accounts) {
          user.getAccountUsers().then(function(accountUsers) {
            testAccountUser = accountUsers[0];
            testAccount = accounts[0];
            done();
          });
        });
      });
    });
  });

  afterEach(function(done) {
    models.sequelize.sync({ force: true }).then(() => {
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

  function requestObject(params) {
    let newParams = params || {};

    return {
      user: {
        id: testUser.id,
        ownerAccountId: testAccount.id,
        email: 'someother@email.com'
      },
      body: {
        firstName: 'FirstName',
        lastName: 'LastName',
        gender: 'male',
        email: 'some@email.com'
      },
      query: {
        id: newParams.id,
        type: newParams.type
      }
    };
  }

  describe('#createOrFindAccountManager', function() {
    let role = 'accountManager';
    describe('happy path', function() {
      it.skip('should find existing user', function (done) {
        let req = requestObject();
        req.body.email = 'lilu2.tanya@gmail.com';
        let res = { locals: {currentDomain: { id: testAccount.id, name: testAccount.name, roles: [role] } } }

        accountManagerService.createOrFindAccountManager(req, res, function(error, params) {
          if(error) {
            done(error);
          }

          let returnParams = {
            accountUserId: testAccountUser.id,
            accountId: testAccount.id,
            userType: 'existing',
            role: 'accountManager'
          };

          assert.equal(error, null);
          assert.deepEqual(params, returnParams);
          done();
        });
      });

      it('should create new user', function (done) {
        let req = requestObject();
        let res = { locals: {currentDomain: { id: testAccount.id, name: testAccount.name, roles: [role] } } }

        accountManagerService.createOrFindAccountManager(req, res, function(error, params) {
          if(error) {
            done(error);
          }

          AccountUser.find({ where: { email: req.body.email } }).then(function(accountUser) {
            if(accountUser) {
              let returnParams = {
                userId: accountUser.UserId,
                accountUserId: accountUser.id,
                accountId: testAccount.id,
                userType: 'new',
                role: accountUser.role
              };

              assert.equal(error, null);
              assert.deepEqual(params, returnParams);
              done();
            }
            else {
              done('AccountUser not found');
            }
          });
        });
      });
    });

    describe('sad path', function() {
      it('should fail because of inviting himself', function (done) {
        let req = requestObject();
        req.user.email = 'some@email.com';
        let res = { locals: {currentDomain: { id: testAccount.id, name: testAccount.name, roles: [role] } } }

        accountManagerService.createOrFindAccountManager(req, res, function(error, params) {
          assert.deepEqual(error, { email: 'You are trying to invite yourself.' });
          done();
        });
      });

      it('should fail because of already accepted', function (done) {
        let req = requestObject();
        req.user.id = testUser.id + 99;
        req.body.email = 'lilu.tanya@gmail.com';
        let res = { locals: {currentDomain: { id: testAccount.id, name: testAccount.name, roles: [role] } } }

        accountManagerService.createOrFindAccountManager(req,res, function(error, params) {
          assert.deepEqual(error, { email: 'This account has already accepted invite.' });
          done();
        });
      });
    });
  });

  describe('#findAccountManagers', function() {
    let role = 'accountManager';

    it('should find accepted user', function (done) {
      let req = requestObject();
      let res = { locals: {currentDomain: { id: testAccount.id, name: testAccount.name, roles: [role] } } }

      accountManagerService.createOrFindAccountManager(req, res, function(error, params) {
        if(error) {
          done(error);
        }

        AccountUser.find({ where: { email: req.body.email } }).then(function(accountUser) {
          inviteService.createInvite(params, function(error, invite) {
            if(error) {
              done(error);
            }

            let userParams = { accountName: 'newname', password: 'newpassword' };
            inviteService.acceptInviteNew(invite.token, userParams, function(error, message) {
              if(error) {
                done(error);
              }

              async.parallel(countTables({ invite: 0, account: 1, user: 2, accountUser: 2 }), function(error, result) {
                if(error) {
                  done(error);
                }
                accountManagerService.findAccountManagers(testAccount.id, function(error, userArray) {
                  let subject = userArray[0];
                  assert.equal(subject.state, "active");
                  assert.equal(subject.AccountId, testAccount.id);
                  done();
                });
              });
            });
          });
        });
      });
    });

    it('should find invited user', function (done) {

      let req = requestObject();
      let res = { locals: {currentDomain: { id: testAccount.id, name: testAccount.name, roles: [role] } } }
      accountManagerService.createOrFindAccountManager(req, res, function(error, params) {
        if(error) {
          done(error);
        }

        User.find({ where: { email: req.body.email } }).then(function(user) {
          inviteService.createInvite(params, function(error, invite) {
            if(error) {
              done(error);
            }

            async.parallel(countTables({ invite: 1, account: 1, user: 2, accountUser: 2 }), function(error, result) {
              if(error) {
                done(error);
              }

              accountManagerService.findAccountManagers(testAccount.id, function(error, userArray) {
                let subject = userArray[1];
                assert.equal(subject.state, "invited");
                assert.equal(subject.AccountId, testAccount.id);
                done();
              });
            });
          });
        });
      });
    });
  });

  describe('#findAndRemoveAccountUser', function() {
    let role = 'accountManager';

    it('should remove account from list', function (done) {
      let req = requestObject();
      let res = { locals: {currentDomain: { id: testAccount.id, name: testAccount.name, roles: [role] } } }

      accountManagerService.createOrFindAccountManager(req, res, function(error, params) {
        if(error) {
          done(error);
        }
        AccountUser.find({ where: { email: req.body.email } }).then(function(accountUser) {
          inviteService.createInvite(params, function(error, invite) {
            if(error) {
              done(error);
            }

            let userParams = { accountName: 'newname', password: 'newpassword' };
            inviteService.acceptInviteNew(invite.token, userParams, function(error, message) {
              if(error) {
                done(error);
              }

              async.parallel(countTables({ invite: 0, account: 1, user: 2, accountUser: 2 }), function(error, result) {
                if(error) {
                  done(error);
                }

                accountManagerService.findAndRemoveAccountUser(accountUser.id, function(error, message) {
                  assert.equal(error, null);
                  assert.equal(message, 'Successfully removed account from Account List');

                  async.parallel(countTables({ invite: 0, account: 1, user: 2, accountUser: 1 }), function(error, result) {
                    done(error);
                  });
                });
              });
            });
          });
        });
      });
    });
  });
});
