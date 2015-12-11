'use strict';

var models = require('./../../models');
var Invite = models.Invite;
var User = models.User;
var Account = models.Account;
var AccountUser = models.AccountUser;

var userService = require('./../../services/users');
var inviteService = require('./../../services/invite');
var assert = require('chai').assert;
var async = require('async');

var testUser1 = null, testUser2 = null, testAccount = null;

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
      status: "invited"
    }

    models.sequelize.sync({ force: true }).then(() => {
      userService.create(attrs1, function(err, user) {
        testUser1 = user;
        user.getOwnerAccount().then(function(accounts) {
          testAccount = accounts[0];
          userService.create(attrs2, function(err, user) {
            testUser2 = user;
            done();
          });
        })
      });
    });
  });

  function validParams(userType) {
    return {
      userId: testUser2.id,
      accountId: testAccount.id,
      role: 'accountManager',
      userType: userType || 'new'
    };
  };

  function countTables(invite, account, user, accountUser) {
    return [
      function(cb) {
        Invite.count().then(function(c) {
          assert.equal(c, invite);
          cb();
        });
      },
      function(cb) {
        Account.count().then(function(c) {
          assert.equal(c, account);
          cb();
        });
      },
      function(cb) {
        User.count().then(function(c) {
          assert.equal(c, user);
          cb();
        });
      },
      function(cb) {
        AccountUser.count().then(function(c) {
          assert.equal(c, accountUser);
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
        inviteService.createInvite({}, false, function(error, invite) {
          assert.equal(error.name, 'SequelizeValidationError');
          assert.equal(invite, null);
          done();
        });
      });
    });

    describe('happy path', function() {
      it('should succeed and return invite', function (done) {
        let params = validParams();
        inviteService.createInvite(params, false, function(error, invite) {
          assert.equal(error, null);
          assert.equal(invite.userId, params.userId);
          assert.equal(invite.accountId, params.accountId);
          assert.equal(invite.role, params.role);
          assert.equal(invite.userType, params.userType);
          done();
        });
      });

      it('should succeed, send email and return invite', function (done) {
        let params = validParams();
        inviteService.createInvite(params, true, function(error, invite) {
          done('not finished');
        });
      });
    });
  });

  describe('#removeInvite', function() {
    describe('existing user', function() {
      it('should succeed on removing invite', function (done) {
        let params = validParams('existing');
        inviteService.createInvite(params, false, function(error, invite) {
          assert.equal(error, null);

          async.parallel(countTables(1, 2, 2, 2), function(error, result) {
            if(error) {
              done(error);
            }

            inviteService.removeInvite(invite, function(error) {
              if(error) {
                done(error);
              }

              async.parallel(countTables(0, 2, 2, 2), function(error, result) {
                done(error);
              });
            });
          });
        });
      });
    });

    describe('new user', function() {
      it('should succeed on removing invite', function (done) {
        let params = validParams();
        inviteService.createInvite(params, false, function(error, invite) {
          assert.equal(error, null);
          async.parallel(countTables(1, 2, 2, 2), function(error, result) {
            if(error) {
              done(error);
            }

            inviteService.removeInvite(invite, function(error) {
              if(error) {
                done(error);
              }

              async.parallel(countTables(0, 1, 1, 1), function(error, result) {
                done(error);
              });
            });
          });
        });
      });
    });
  });

  describe('#findInvite', function() {
    it('should succeed on finding invite', function (done) {
      let params = validParams();
      inviteService.createInvite(params, false, function(error, invite) {
        assert.equal(error, null);
        inviteService.findInvite(invite.token, function(error, result) {
          assert.equal(error, null);
          assert.deepEqual(invite, result);
          done();
        });
      });
    });

    it('should fail on finding invite', function (done) {
      let params = validParams();
      inviteService.createInvite(params, false, function(error, invite) {
        assert.equal(error, null);
        inviteService.findInvite('some token', function(error, result) {
          assert.equal(error, 'Invite not found');
          assert.equal(result, null);
          done();
        });
      });
    });
  });

  describe('#declineInvite', function() {
    it('should succeed on declining invite', function (done) {
      let params = validParams();
      inviteService.createInvite(params, false, function(error, invite) {
        assert.equal(error, null);
        inviteService.declineInvite(invite, function(error, message) {
          assert.equal(error, null);
          assert.equal(message, 'Successfully declined invite');
          done();
        });
      });
    });
  });

  describe('#acceptInviteExisting', function() {
    it('should succeed on accepting invite', function (done) {
      let params = validParams();
      inviteService.createInvite(params, false, function(error, invite) {
        assert.equal(error, null);
        assert.equal(invite.User.status, 'invited');

        async.parallel(countTables(1, 2, 2, 2), function(error, result) {
          if(error) {
            done(error);
          }

          inviteService.acceptInviteExisting(invite, function(error, message) {
            if(error) {
              done(error);
            }

            invite.User.reload().then(function(user) {
              assert.equal(user.status, 'accepted');

              async.parallel(countTables(0, 2, 2, 3), function(error, result) {
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
      let params = validParams();
      inviteService.createInvite(params, false, function(error, invite) {
        assert.equal(error, null);
        assert.equal(invite.User.status, 'invited');
        let oldPassword = invite.User.encryptedPassword;

        async.parallel(countTables(1, 2, 2, 2), function(error, result) {
          if(error) {
            done(error);
          }

          let params = { accountName: 'newname', password: 'newpassword' };
          inviteService.acceptInviteNew(invite, params, function(error, message) {
            if(error) {
              done(error);
            }

            invite.User.reload().then(function(user) {
              assert.equal(user.status, 'accepted');
              assert.notEqual(user.encryptedPassword, oldPassword);

              user.getOwnerAccount().then(function(accounts) {
                assert.equal(accounts[0].name, 'newname');
                async.parallel(countTables(0, 2, 2, 3), function(error, result) {
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
