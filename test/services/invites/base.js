'use strict';

var {Invite, sequelize, Session, AccountUser, Account} = require('../../../models');

var userService = require('../../../services/users');
var inviteService = require('../../../services/invite');
var accountManagerService = require('../../../services/accountManager');
var backgroundQueue = require('../../../services/backgroundQueue');
var subscriptionFixture = require('../../fixtures/subscription');
var assert = require('chai').assert;
var async = require('async');

describe('SERVICE - Invite basic logic', function() {
  var testUser, accountUser, testUser2, testAccount, accountUser2 = null;
  let user1Attrs = {
    accountName: "Lilo",
    firstName: "Lilu",
    lastName: "Dalas",
    password: "multipassword",
    email: "lilu.tanya@gmail.com",
    gender: "male"
  };

  let user2Attrs = {
    accountName: "DainisL",
    firstName: "Dainis",
    lastName: "Lapins",
    password: "cool_password",
    email: "dainis@gmail.com",
    gender: "male",
  }

  beforeEach(function(done) {

    sequelize.sync({ force: true }).then(() => {
      userService.create(user1Attrs, (err, user1) =>  {
        testUser = user1;
        user1.getOwnerAccount().then((accounts) =>  {
          testAccount = accounts[0];
          accountUser = accounts[0].AccountUser
          userService.create(user2Attrs, (err, user2) =>  {
            user2.getAccountUsers().then( (results) => {
              accountUser2 = results[0],
              testUser2 = user2;
              backgroundQueue.setUpQueue(null, null, () => {
                done();
              })
            })
          });
        })
      });
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
            accountUserId: "Account User Id can't be empty"
          };
          try {
            assert.deepEqual(error, errorParams);
            done();
          } catch (e) {
              done(e);
          }
        });
      });
    });

    describe('happy path', function() {
      it('should succeed and return invite', function (done) {
        let params = {
          accountUserId: accountUser2.id,
          userId: accountUser2.UserId,
          accountId: accountUser2.AccountId,
          role: 'accountManager'
        }

        inviteService.createInvite(params).then(function(invite) {
          try {
            assert.equal(invite.userId, params.userId);
            assert.equal(invite.role, params.role);
            done();
          } catch (e) {
            done(e);
          }
        }, function(error) {
          done(error);
          });
      });
    });
  });

  describe('#createBulkInvites', function() {
    describe('sad path', function() {
      it('should fail with invalid params', function (done) {
        let invalidInviteParams = [
          {
            accountUserId: accountUser2.id,
            userId: accountUser2.UserId,
            accountId: accountUser2.AccountId,
            role: 'accountManager'
          },
          {
            role: 'accountManager'
          },{
            role: 'participant',
          }
      ]
        inviteService.createBulkInvites(invalidInviteParams).then(function(invites) {
          done('Should not get here!');
        }, function(errors) {
          let errorParams = {
            accountUserId: "Account User Id can't be empty"
          };
          try {
            assert.typeOf(errors,'array')
            assert.deepEqual(errors[0], errorParams);
            done();
          } catch (e) {
            done(e)
          }
        });
      });
    });

    describe('happy path', function() {
      it('should succeed and return invite', function (done) {
        let params = [{
          accountUserId: accountUser2.id,
          userId: accountUser2.userId,
          accountId: accountUser2.AccountId,
          role: 'accountManager'
        }]

        inviteService.createBulkInvites(params).then(function(invites) {
          try {
            assert.equal(invites[0].userId, params[0].userId);
            assert.equal(invites[0].role, params[0].role);
            done();
          } catch (e) {
            done(e);
          }
        }, function(error) {
          done(error);
          });
      });
    });
  });

  describe('#findAndRemoveInvite', function() {
    describe('happy path', function() {
      it('should succeed remove invite for existing user', function (done) {
        let params = {
          accountUserId: accountUser2.id,
          userId: accountUser2.UserId,
          accountId: accountUser2.AccountId,
          role: 'accountManager'
        }
        inviteService.createInvite(params).then(function(invite) {
          inviteService.findAndRemoveInvite({ accountUserId: invite.accountUserId }).then((message) => {
            AccountUser.count().then(function(c) {
              try {
                assert.equal(c, 2);
                assert.equal(message, "Successfully removed Invite");
                done();
              } catch (e) {
                done(e);
              }
            });

          }, function(error) {
            done(error);
          });
        });
      });
    });
  });
});
