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

var testUser = null, testUser2 = null, testAccount = null, accountUser2 = null;

describe('SERVICE - Invite', function() {
  beforeEach(function(done) {
    let attrs1 = {
      accountName: "Lilo",
      firstName: "Lilu",
      lastName: "Dalas",
      password: "multipassword",
      email: "lilu.tanya@gmail.com",
      gender: "male"
    };

    let attrs2 = {
      accountName: "DainisL",
      firstName: "Dainis",
      lastName: "Lapins",
      password: "cool_password",
      email: "dainis@gmail.com",
      gender: "male",
    }

    models.sequelize.sync({ force: true }).then(() => {
      userService.create(attrs1, function(err, user1) {
        testUser = user1;
        user1.getOwnerAccount().then(function(accounts) {
          testAccount = accounts[0];
          userService.create(attrs2, function(err, user2) {
            user2.getAccountUsers().then(function (results) {
              accountUser2 = results[0],
              testUser2 = user2;
              done();
            })
          });
        })
      });
    });
  });

  function requestObject(user, body) {
    return {
      user: { id: user.id, email: user.email },
      body: body
    };
  }

  function validParams(user, account, body, cb) {
    let role = "accountManager"
    let req = requestObject(user, body)
    let res = { locals: {currentDomain: { id: account.id, name: account.name, roles: [role] } } }
    accountManagerService.createOrFindAccountManager(req, res, function(error, params) {
      cb(error, params);
    });
  };

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

  afterEach(function(done) {
    models.sequelize.sync({ force: true }).then(() => {
      done();
    });
  });

  describe('#createInvite', function() {
    describe('sad path', function() {
      it('should fail without params', function (done) {
        inviteService.createInvite({}, function(error, invite) {
          let errorParams = {
            role: 'Role: cannot be null',
            accountId: 'Account Id: cannot be null',
            accountUserId: 'Account User Id: cannot be null',
            userType: 'User Type: cannot be null'
          };
          assert.deepEqual(error, errorParams);
          assert.equal(invite, null);
          done();
        });
      });
    });

    describe('happy path', function() {
      it('should succeed and return invite', function (done) {
        let body = {firstName: accountUser2.firstName,
          lastName: accountUser2.lastName,
          gender: accountUser2.gender,
          email: accountUser2.email
        }
        validParams(testUser, testAccount, body, function(err, params) {
          inviteService.createInvite(params, function(error, invite, result) {
            assert.equal(error, null);
            assert.equal(invite.userId, params.userId);
            assert.equal(invite.accountId, params.accountId);
            assert.equal(invite.role, params.role);
            assert.equal(invite.userType, params.userType);
            assert.include(result.data.html, 'Hello! And welcome to Klzii');
            assert.include(result.data.html, 'You can login anytime with your');
            done();
          });
        })
      });
    });
  });

  describe('#removeInvite', function() {
    describe('existing user', function() {
      it('should succeed on removing invite', function (done) {
        let body = {firstName: accountUser2.firstName,
          lastName: accountUser2.lastName,
          gender: accountUser2.gender,
          email: accountUser2.email
        }
        validParams(testUser, testAccount, body, function(err, params) {
          inviteService.createInvite(params, function(error, invite) {
            assert.equal(error, null);

            async.parallel(countTables({ invite: 1, account: 2, user: 2, accountUser: 3 }), function(error, result) {
              if(error) {
                done(error);
              }

              inviteService.removeInvite(invite, function(error, result) {
                assert.isTrue(result);
                if(error) {
                  done(error);
                }

                async.parallel(countTables({ invite: 0, account: 2, user: 2, accountUser: 3 }), function(error, result) {
                  done(error);
                });
              });
            });
          });
        });
      });
    });

    describe('new user', function() {
      it('should succeed on removing invite', function (done) {
        let body = {firstName: "newName",
          lastName: "newlastName",
          gender: "male",
          email: "newuser@gmail.com"
        }
        validParams(testUser, testAccount, body, function(err, params) {
          inviteService.createInvite(params, function(error, invite) {
            assert.equal(error, null);
            async.parallel(countTables({ invite: 1, account: 2, user: 3, accountUser: 3 }), function(error, result) {
              if(error) {
                done(error);
              }

              inviteService.removeInvite(invite, function(error) {
                if(error) {
                  done(error);
                }

                async.parallel(countTables({ invite: 0, account: 2, user: 2, accountUser: 2 }), function(error, result) {
                  done(error);
                });
              });
            });
          });
        });
      });
    });
  });

  describe('#findInvite', function() {
    it('should succeed on finding invite', function (done) {
      let body = {firstName: "newName",
        lastName: "newlastName",
        gender: "male",
        email: "newuser@gmail.com"
      }
      validParams(testUser, testAccount, body, function(err, params) {
        inviteService.createInvite(params, function(error, invite) {
          assert.equal(error, null);
          inviteService.findInvite(invite.token, function(error, result) {
            assert.equal(error, null);
            assert.equal(invite.id, result.id);
            done();
          });
        });
      });
    });

    it('should fail on finding invite', function (done) {
      inviteService.findInvite('some token', function(error, result) {
        assert.equal(error, 'Invite not found');
        assert.equal(result, null);
        done();
      });
    });
  });

  describe('#declineInvite', function() {
    it('should succeed on declining invite', function (done) {
      let body = {firstName: "newName",
        lastName: "newlastName",
        gender: "male",
        email: "newuser@gmail.com"
      }
      validParams(testUser, testAccount, body, function(err, params) {
        inviteService.createInvite(params, function(error, invite) {
          assert.equal(error, null);
          inviteService.declineInvite(invite.token, function(error, result, message) {
            assert.equal(error, null);
            assert.equal(invite.id, result.id);
            assert.equal(message, 'Successfully declined invite');
            done();
          });
        });
      });
    });
  });

  describe('#acceptInviteExisting', function() {
    it('should succeed on accepting invite', function (done) {
      let body = {firstName: accountUser2.firstName,
        lastName: accountUser2.lastName,
        gender: accountUser2.gender,
        email: accountUser2.email
      }
      validParams(testUser, testAccount, body, function(err, params) {
        inviteService.createInvite(params, function(error, invite) {
          assert.equal(error, null);

          async.parallel(countTables({ invite: 1, account: 2, user: 2, accountUser: 3 }), function(error, result) {
            if(error) {
              done(error);
            }

            inviteService.acceptInviteExisting(invite.token, function(error, _result, message) {
              if(error) {
                done(error);
              }
              async.parallel(countTables({ invite: 0, account: 2, user: 2, accountUser: 3 }), function(error, result) {
                done(error);
              });
            });
          });
        });
      });
    });
  });

  describe('#acceptInviteNew', function() {
    it('should succeed on accepting invite', function (done) {
      let body = { firstName: "newName",
        lastName: "newlastName",
        gender: "male",
        email: "newuser@gmail.com"
      }
      validParams(testUser, testAccount, body, function(err, params) {
        inviteService.createInvite(params, function(error, invite) {
          assert.equal(error, null);
          let oldPassword = invite.User.encryptedPassword;

          async.parallel(countTables({ invite: 1, account: 2, user: 3, accountUser: 3 }), function(error, result) {
            if(error) {
              done(error);
            }

            let userParams = { accountName: 'newname', password: 'newpassword' };
            inviteService.acceptInviteNew(invite.token, userParams, function(error, message) {
              if(error) {
                done(error);
              }

              invite.User.reload().then(function(user) {
                assert.notEqual(user.encryptedPassword, oldPassword);

                user.getAccounts().then(function(accounts) {
                  assert.equal(accounts[0].name, testAccount.name);
                  async.parallel(countTables({ invite: 0, account: 2, user: 3, accountUser: 3 }), function(error, result) {
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
