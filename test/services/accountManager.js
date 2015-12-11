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

  function requestObject() {
    return {
      user: {
        id: testUser.id,
        accountOwnerId: testAccount.id
      },
      body: {
        firstName: 'FirstName',
        lastName: 'LastName',
        gender: 'male',
        email: 'some@email.com'
      }
    };
  }

  describe('#createOrFindUser', function() {
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

  describe.only('#findAccountManagers', function() {
    it('should find accepted user', function (done) {
      let req = requestObject();
      accountManagerService.createOrFindUser(req, function(error, params) {
        if(error) {
          done(error);
        }

        User.find({ where: { email: req.body.email } }).then(function(user) {
          inviteService.createInvite(params, false, function(error, invite) {
            if(error) {
              done(error);
            }

            let userParams = { accountName: 'newname', password: 'newpassword' };
            inviteService.acceptInviteNew(invite, userParams, function(error, message) {
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

});
