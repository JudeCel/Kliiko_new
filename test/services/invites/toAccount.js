'use strict';

var {Invite, sequelize, Session, AccountUser, Account} = require('../../../models');

var userService = require('../../../services/users');
var inviteService = require('../../../services/invite');
var accountManagerService = require('../../../services/accountManager');
var backgroundQueue = require('../../../services/backgroundQueue');
var subscriptionFixture = require('../../fixtures/subscription');
var assert = require('chai').assert;
var async = require('async');

describe.only('SERVICE - Invite to Account', function() {
  var testUser, accountUser, testUser2,
    testAccount, accountUserWithoutUser, accountUserWithUserInOtherAccount,
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
                  let accountUserParamas = {
                    email: "dainis+10@gmail.com",
                    AccountId: accountUser.AccountId,
                    firstName: "Dainis",
                    lastName: "Lapins",
                    gender: "male",
                    "role": "observer",
                    active: false
                  }
                AccountUser.create(accountUserParamas).then((newaccountUser) => {
                  accountUserWithoutUser = newaccountUser
                  let accountUserParams2 ={
                    email: "dainis@gmail.com",
                    AccountId: accountUser2.AccountId,
                    firstName: "Dainis",
                    lastName: "Lapins",
                    gender: "male",
                    "role": "observer",
                    active: false
                  }
                  AccountUser.create(accountUserParams2).then((newaccountUser) => {
                    accountUserWithUserInOtherAccount = newaccountUser
                    done();
                  })
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
          userId: accountUser2.UserId,
          accountId: accountUser.AccountId,
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

      it('should succeed remove invite for new user not remove account user', function (done) {
        let accountUserParamas = {
          email: "dainis+10@gmail.com",
          AccountId: accountUser.AccountId,
          firstName: "Dainis",
          lastName: "Lapins",
          gender: "male",
          "role": "observer",
          active: false
        }

        AccountUser.create(accountUserParamas).then((newaccountUser) => {
          let params = {
            accountUserId: newaccountUser.id,
            accountId: newaccountUser.AccountId,
            role: 'accountManager'
          }

          inviteService.createInvite(params).then(function(invite) {
            inviteService.findAndRemoveInvite({ accountUserId: invite.accountUserId }).then((message) => {
              AccountUser.count().then(function(c) {
                try {
                  assert.equal(c, 3);
                  assert.equal(message, "Successfully removed Invite");
                  done();
                } catch (e) {
                  done(e);
                }
              });
            }, function(error) {
              done(error);
            });
          })
        }, (error) => {
          done(errro)
        })
      });
    });
  });

  describe('#acceptInvite', function() {
    describe('happy path', function() {
      it('should succeed accept for existing user', function (done) {
        let params = {
          accountUserId: accountUser2.id,
          userId: accountUser2.UserId,
          accountId: accountUser.AccountId,
          role: 'accountManager'
        }

        inviteService.createInvite(params).then(function(invite) {
          inviteService.acceptInvite(invite.token).then((message) => {
            // AccountUser.count().then(function(c) {
            //   try {
            //     assert.equal(c, 2);
            //     assert.equal(message, "Successfully removed Invite");
            //     done();
            //   } catch (e) {
            //     done(e);
            //   }
            // });

          }, function(error) {
            done(error);
          });
        });
      });

      // it('should succeed remove invite for new user not remove account user', function (done) {
      //   let accountUserParamas = {
      //     email: "dainis+10@gmail.com",
      //     AccountId: accountUser.AccountId,
      //     firstName: "Dainis",
      //     lastName: "Lapins",
      //     gender: "male",
      //     "role": "observer",
      //     active: false
      //   }
      //
      //   AccountUser.create(accountUserParamas).then((newaccountUser) => {
      //     let params = {
      //       accountUserId: newaccountUser.id,
      //       accountId: newaccountUser.AccountId,
      //       role: 'accountManager'
      //     }
      //
      //     inviteService.createInvite(params).then(function(invite) {
      //       inviteService.findAndRemoveInvite({ accountUserId: invite.accountUserId }).then((message) => {
      //         AccountUser.count().then(function(c) {
      //           try {
      //             assert.equal(c, 3);
      //             assert.equal(message, "Successfully removed Invite");
      //             done();
      //           } catch (e) {
      //             done(e);
      //           }
      //         });
      //       }, function(error) {
      //         done(error);
      //       });
      //     })
      //   }, (error) => {
      //     done(errro)
      //   })
      // });
    });
  });
});
