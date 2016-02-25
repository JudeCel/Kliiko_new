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
        inviteService.createInvite({}).then(function(invite) {
          done('Should not get here!');
        }, function(error) {
          let errorParams = {
            role: "Role can't be empty",
            ownerType: "Owner Type can't be empty",
            ownerId: "Owner Id can't be empty",
            accountUserId: "Account User Id can't be empty",
            userType: "User Type can't be empty"
          };

          assert.deepEqual(error, errorParams);
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
          inviteService.createInvite(params).then(function(data) {
            assert.equal(data.invite.userId, params.userId);
            assert.equal(data.invite.ownerId, params.ownerId);
            assert.equal(data.invite.role, params.role);
            assert.equal(data.invite.userType, params.userType);
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
          inviteService.createInvite(params).then(function(data) {
            async.parallel(countTables({ invite: 1, account: 2, user: 2, accountUser: 3 }), function(error, result) {
              if(error) {
                done(error);
              }

              inviteService.removeInvite(data.invite, function(error, result) {
                if(error) {
                  done(error);
                }

                assert.equal(result, inviteService.messages.removed);
                async.parallel(countTables({ invite: 0, account: 2, user: 2, accountUser: 3 }), function(error, result) {
                  done(error);
                });
              });
            });
          });
        });
      });

      it('should fail on removing invite because confirmed', function (done) {
        let body = {firstName: accountUser2.firstName,
          lastName: accountUser2.lastName,
          gender: accountUser2.gender,
          email: accountUser2.email
        }
        validParams(testUser, testAccount, body, function(err, params) {
          inviteService.createInvite(params).then(function(data) {
            Invite.update({ status: 'confirmed' }, { where: { id: data.invite.id } }).then(function() {
              async.parallel(countTables({ invite: 1, account: 2, user: 2, accountUser: 3 }), function(error, result) {
                if(error) {
                  done(error);
                }

                inviteService.removeInvite(data.invite, function(error, result) {
                  assert.equal(error, inviteService.messages.cantRemove);
                  async.parallel(countTables({ invite: 1, account: 2, user: 2, accountUser: 3 }), function(error, result) {
                    done(error);
                  });
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
          inviteService.createInvite(params).then(function(data) {
            async.parallel(countTables({ invite: 1, account: 2, user: 3, accountUser: 3 }), function(error, result) {
              if(error) {
                done(error);
              }

              inviteService.removeInvite(data.invite, function(error, result) {
                if(error) {
                  done(error);
                }

                assert.equal(result, inviteService.messages.removed);
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
        inviteService.createInvite(params).then(function(data) {
          inviteService.findInvite(data.invite.token, function(error, result) {
            assert.equal(error, null);
            assert.equal(data.invite.id, result.id);
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
        inviteService.createInvite(params).then(function(data) {
          inviteService.declineInvite(data.invite.token, function(error, result, message) {
            assert.equal(error, null);
            assert.equal(data.invite.id, result.id);
            assert.equal(message, inviteService.messages.declined);
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
        inviteService.createInvite(params).then(function(data) {
          async.parallel(countTables({ invite: 1, account: 2, user: 2, accountUser: 3 }), function(error, result) {
            if(error) {
              done(error);
            }

            inviteService.acceptInviteExisting(data.invite.token, function(error, _result, message) {
              if(error) {
                done(error);
              }
              async.parallel(countTables({ invite: 1, account: 2, user: 2, accountUser: 3 }), function(error, result) {
                Invite.find({ where: { id: data.invite.id } }).then(function(invite) {
                  assert.equal(invite.status, 'confirmed');
                  done(error);
                });
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
        inviteService.createInvite(params).then(function(data) {
          let oldPassword = data.invite.User.encryptedPassword;

          async.parallel(countTables({ invite: 1, account: 2, user: 3, accountUser: 3 }), function(error, result) {
            if(error) {
              done(error);
            }

            let userParams = { accountName: 'newname', password: 'newpassword' };
            inviteService.acceptInviteNew(data.invite.token, userParams, function(error, message) {
              if(error) {
                done(error);
              }

              data.invite.User.reload().then(function(user) {
                assert.notEqual(user.encryptedPassword, oldPassword);

                user.getAccounts().then(function(accounts) {
                  assert.equal(accounts[0].name, testAccount.name);
                  async.parallel(countTables({ invite: 1, account: 2, user: 3, accountUser: 3 }), function(error, result) {
                    Invite.find({ where: { id: data.invite.id } }).then(function(invite) {
                      assert.equal(invite.status, 'confirmed');
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

});
