'use strict';

var {Invite, sequelize, Session, AccountUser, Account, User} = require('../../../models');

var userService = require('../../../services/users');
var inviteService = require('../../../services/invite');
var accountManagerService = require('../../../services/accountManager');
var subscriptionFixture = require('../../fixtures/subscription');
var assert = require('chai').assert;
var async = require('async');

describe('SERVICE - Invite to Account', function() {
  var testUser1, accountUser1, testUser2,
    testAccount1, accountUserWithoutUser, accountUserWithUser,
    accountUser2 = null;

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

  // Tests testUser1 - user with accaount user in account 1
  // Tests testAccount1 - tests account 1
  // Tests accountUser1 - testUser1 account users in account testAccount1
  //
  // Tests testUser2 - user with accaount user in account 2
  // Tests testAccount2 - tests account 2
  // Tests accountUser2 - testUser2 account users in account testAccount2
  //
  // Tests accountUserWithoutUser - Account user without user in account 1
  // Tests accountUserWithUser - account user in account 2 with user in system

  beforeEach(function(done) {
    sequelize.sync({ force: true }).then(() => {
      userService.create(user1Attrs, (err, user1) =>  {
        testUser1 = user1;
        user1.getOwnerAccount().then((accounts) =>  {
          testAccount1 = accounts[0];
          accountUser1 = accounts[0].AccountUser
          userService.create(user2Attrs, (err, user2) =>  {
            user2.getAccountUsers().then( (results) => {
              accountUser2 = results[0],
              testUser2 = user2;
              let accountUserParamas = {
                email: "dainis+10@gmail.com",
                AccountId: accountUser1.AccountId,
                firstName: "Dainis",
                lastName: "Lapins",
                gender: "male",
                "role": "observer",
                active: false
              }
              let accountUserParams2 ={
                email: "dainis@gmail.com",
                AccountId: accountUser1.AccountId,
                firstName: "Dainis",
                lastName: "Lapins",
                gender: "male",
                "role": "observer",
                active: false
              }

              AccountUser.create(accountUserParamas).then((newAccountUser) => {
                accountUserWithoutUser = newAccountUser
                AccountUser.create(accountUserParams2).then((newAccountUser2) => {
                  accountUserWithUser = newAccountUser2
                  done();
                })
              })
            })
          });
        })
      });
    });
  });

  describe('#findAndRemoveInvite', function() {
    describe('happy path', function() {
      it('should succeed remove invite for existing user', function (done) {
        let params = {
          accountUserId: accountUser2.id,
          accountId: accountUser2.AccountId,
          role: 'accountManager'
        }
        inviteService.createInvite(params).then(function(invite) {
          inviteService.findAndRemoveInvite({ accountUserId: invite.accountUserId }).then((message) => {
            AccountUser.count().then(function(c) {
              try {
                assert.equal(c, 4);
                assert.equal(message, inviteService.messages.removed);
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

      it('should succeed remove invite for new user not remove account user', function (done) {
          let params = {
            accountUserId: accountUserWithUser.id,
            accountId: accountUserWithUser.AccountId,
            role: 'accountManager'
          }

          inviteService.createInvite(params).then(function(invite) {
            inviteService.findAndRemoveInvite({ accountUserId: invite.accountUserId }).then((message) => {
              AccountUser.count().then(function(c) {
                try {
                  assert.equal(c, 4);
                  assert.equal(message, inviteService.messages.removed);
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

  describe('#acceptInvite', function() {
    describe('happy path', function() {
      it('should succeed accept for existing user', function (done) {
        let params = {
          accountUserId: accountUserWithUser.id,
          accountId: accountUserWithUser.AccountId,
          role: 'accountManager'
        }

        inviteService.createInvite(params).then(function(invite) {
          inviteService.acceptInvite(invite.token).then((response) => {
            Invite.find({where: response.invite.id}).then((findInvite) => {
              AccountUser.find({where: response.invite.accountUserId}).then((accountUser) => {
                if (!findInvite) { return done("Invite not found")}
                if (!accountUser) { return done("Account User not found")}

                try {
                  assert.equal(response.message, inviteService.messages.confirmed);
                  assert.equal(findInvite.status, "confirmed");
                  assert.equal(accountUser.active, true);
                  assert.equal(accountUser.status, 'active');
                  done();
                } catch (e) {
                  done(e);
                }
              });
            });
          }, function(error) {
            done(error);
          });
        }, (error) => {
          done(error)
        });
      });

      it('should succeed, if accept new user need params with password', function (done) {
        let inviteParams = {
          accountUserId: accountUserWithoutUser.id,
          accountId: accountUserWithoutUser.AccountId,
          role: 'accountManager'
        }
        let userParams ={ password: 'qwerty1234'}

        inviteService.createInvite(inviteParams).then(function(invite) {
          inviteService.acceptInvite(invite.token, userParams).then((response) => {
            Invite.find({where: response.invite.id, include: [{model: AccountUser, include: [User] }]}).then((findInvite) => {
                if (!findInvite) { return done("Invite not found")}
                if (!findInvite.AccountUser) { return done("Account User not found")}
                if (!findInvite.AccountUser.User) { return done("User not found")}

                try {
                  assert.equal(response.message, inviteService.messages.confirmed);
                  assert.equal(findInvite.status, "confirmed");
                  assert.equal(findInvite.AccountUser.active, true);
                  assert.equal(findInvite.AccountUser.status, 'active');
                  assert.equal(findInvite.AccountUser.User.email, accountUserWithoutUser.email);
                  done();
                } catch (e) {
                  done(e);
                }
            });
          }, function(error) {
            done(error);
          });
        }, (error) => {
          done(error)
        });
      });
    });
  });
});
