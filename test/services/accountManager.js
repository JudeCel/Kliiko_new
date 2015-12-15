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

var testUser = null, testAccount = null;

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
          testAccount = accounts[0];
          done();
        })
      });
    });
  });

  afterEach(function(done) {
    models.sequelize.sync({ force: true }).then(() => {
      done();
    });
  });

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

  function requestObject(params) {
    let newParams = params || {};

    return {
      user: {
        id: testUser.id,
        accountOwnerId: testAccount.id,
        email: 'someother@email.com'
      },
      body: {
        firstName: 'FirstName',
        lastName: 'LastName',
        gender: 'male',
        email: 'some@email.com'
      },
      params: {
        id: newParams.id,
        type: newParams.type
      }
    };
  }

  describe('#createOrFindUser', function() {
    describe('happy path', function() {
      it('should find existing user', function (done) {
        let req = requestObject();
        req.body.email = 'lilu.tanya@gmail.com';

        accountManagerService.createOrFindUser(req, function(error, params) {
          if(error) {
            done(error);
          }

          let returnParams = {
            userId: testUser.id,
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
        accountManagerService.createOrFindUser(req, function(error, params) {
          if(error) {
            done(error);
          }

          User.find({ where: { email: req.body.email } }).then(function(user) {
            if(user) {
              let returnParams = {
                userId: user.id,
                accountId: testAccount.id,
                userType: 'new',
                role: 'accountManager'
              };

              assert.equal(error, null);
              assert.deepEqual(params, returnParams);
              done();
            }
            else {
              done('User not found');
            }
          });
        });
      });
    });

    describe('sad path', function() {
      it('should fail because of inviting himself', function (done) {
        let req = requestObject();
        req.user.email = 'some@email.com';

        accountManagerService.createOrFindUser(req, function(error, params) {
          assert.deepEqual(error, { email: 'You are trying to invite yourself.' });
          done();
        });
      });

      it('should fail because of already accepted', function (done) {
        let req = requestObject();
        req.user.id = 0;
        req.body.email = 'lilu.tanya@gmail.com';

        accountManagerService.createOrFindUser(req, function(error, params) {
          assert.deepEqual(error, { email: 'This account has already accepted invite.' });
          done();
        });
      });
    });
  });

  describe('#findAccountManagers', function() {
    it('should find accepted user', function (done) {
      let req = requestObject();
      accountManagerService.createOrFindUser(req, function(error, params) {
        if(error) {
          done(error);
        }

        User.find({ where: { email: req.body.email } }).then(function(user) {
          inviteService.createInvite(params, function(error, invite) {
            if(error) {
              done(error);
            }

            let userParams = { accountName: 'newname', password: 'newpassword' };
            inviteService.acceptInviteNew(invite.token, userParams, function(error, message) {
              if(error) {
                done(error);
              }

              async.parallel(countTables(0, 2, 2, 3), function(error, result) {
                if(error) {
                  done(error);
                }
                accountManagerService.findAccountManagers(req.user, function(error, userArray) {
                  assert.equal(userArray[0].id, user.id);
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
      accountManagerService.createOrFindUser(req, function(error, params) {
        if(error) {
          done(error);
        }

        User.find({ where: { email: req.body.email } }).then(function(user) {
          inviteService.createInvite(params, function(error, invite) {
            if(error) {
              done(error);
            }

            async.parallel(countTables(1, 2, 2, 2), function(error, result) {
              if(error) {
                done(error);
              }

              accountManagerService.findAccountManagers(req.user, function(error, userArray) {
                assert.equal(userArray[0].id, user.id);
                done();
              });
            });
          });
        });
      });
    });
  });

  describe('#removeInviteOrAccountUser', function() {
    it('should remove invite from list', function (done) {
      let req = requestObject();
      accountManagerService.createOrFindUser(req, function(error, params) {
        if(error) {
          done(error);
        }

        User.find({ where: { email: req.body.email } }).then(function(user) {
          inviteService.createInvite(params, function(error, invite) {
            if(error) {
              done(error);
            }

            async.parallel(countTables(1, 2, 2, 2), function(error, result) {
              if(error) {
                done(error);
              }

              req = requestObject({ id: user.id, type: 'invite' });
              accountManagerService.removeInviteOrAccountUser(req, function(error, message) {
                assert.equal(error, null);
                assert.equal(message, 'Successfully removed Invite');

                async.parallel(countTables(0, 1, 1, 1), function(error, result) {
                  if(error) {
                    done(error);
                  }
                  done();
                });
              });
            });
          });
        });
      });
    });

    it('should remove account from list', function (done) {
      let req = requestObject();
      accountManagerService.createOrFindUser(req, function(error, params) {
        if(error) {
          done(error);
        }

        User.find({ where: { email: req.body.email } }).then(function(user) {
          inviteService.createInvite(params, function(error, invite) {
            if(error) {
              done(error);
            }

            let userParams = { accountName: 'newname', password: 'newpassword' };
            inviteService.acceptInviteNew(invite.token, userParams, function(error, message) {
              if(error) {
                done(error);
              }

              async.parallel(countTables(0, 2, 2, 3), function(error, result) {
                if(error) {
                  done(error);
                }

                req = requestObject({ id: user.id, type: 'account' });
                accountManagerService.removeInviteOrAccountUser(req, function(error, message) {
                  assert.equal(error, null);
                  assert.equal(message, 'Successfully removed account from Account List');

                  async.parallel(countTables(0, 2, 2, 2), function(error, result) {
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
