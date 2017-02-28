'use strict';

var {Invite, Session, AccountUser, Account, SessionMember} = require('../../../models');

var userService = require('../../../services/users');
var inviteService = require('../../../services/invite');
var accountManagerService = require('../../../services/accountManager');
var subscriptionFixture = require('../../fixtures/subscription');
var assert = require('chai').assert;
var async = require('async');
var testDatabase = require("../../database");

describe('SERVICE - Invite to Session', function() {
  var testUser1, accountUser1, testUser2, session,
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

  beforeEach(function(done) {
    testDatabase.prepareDatabaseForTests().then(() => {
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

                let sessionParams = {
                  name: "Test session",
                  step: 'setUp',
                  startTime: new Date,
                  endTime: new Date,
                  accountId: testAccount1.id,
                  type: "focus",
                  timeZone: 'America/Anchorage'
                }

              AccountUser.create(accountUserParamas).then((newaccountUser) => {
                accountUserWithoutUser = newaccountUser
                AccountUser.create(accountUserParams2).then((newaccountUser) => {
                  accountUserWithUser = newaccountUser
                  Session.create(sessionParams).then((result) =>  {
                    session = result;
                    done();
                  }, (error) => {
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

  describe('#createBulkInvites', function() {
    describe('sad path', function() {
      it('should fail with invalid params', function (done) {
        let invalidInviteParams = [
          {
            accountUserId: accountUser2.id,
            userId: accountUser2.UserId,
            accountId: accountUser2.AccountId,
            sessionId: session.id,
            role: 'facilitator'
          },
          {
            role: 'facilitator'
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
            assert.deepEqual(errors, errorParams);
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
          sessionId: session.id,
          role: 'facilitator'
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

  describe('#createFacilitatorInvite', function() {
    describe('sad paths', function() {
      it('should fail already sent invite', function (done) {
        let invaiteParams = {
          accountUserId: accountUser2.id,
          userId: accountUser2.UserId,
          accountId: accountUser2.AccountId,
          sessionId: session.id,
          role: 'facilitator'
        }
          inviteService.createFacilitatorInvite(invaiteParams).then((invites) =>  {
            inviteService.createFacilitatorInvite(invaiteParams).then(function(invites) {
              done();
            }, function(error) {
              try {
                assert.equal(error, "Invite as Host for Dainis Lapins were not sent");
                done();
              } catch (e) {
                done(e);
              }
            });
          }, (error) => {
            done(error)
          });
      });
    });

    describe('happy path', function() {
      it('should succeed and return invite', function (done) {
        let params = {
          accountUserId: accountUser2.id,
          userId: accountUser2.UserId,
          accountId: accountUser2.AccountId,
          role: 'facilitator',
          sessionId: session.id
        }

        inviteService.createFacilitatorInvite(params).then(function() {
            done();
        }, function(error) {
          done(error);
          });
      });
    });
  });

  describe('#updateToFacilitator', function() {
    describe('happy path', function() {
      it('should succeed and change role to facilitator', function (done) {
        AccountUser.update({role: 'participant'}, { where: { id: accountUser1.id }, returning: true }).then(function(accountUserResp) {
          inviteService.updateToFacilitator(accountUserResp[1][0]).then(function(result) {
            try {
              assert.equal(result.role, "facilitator");
              done()
            } catch (e) {
              done(e);
            }
          }, function(error) {
            done(error);
          });
        }, function(error) {
          done(error);
        });
      });

      it('should succeed and not change role', function (done) {
        try {
          assert.equal(accountUser1.role, "accountManager");
          inviteService.updateToFacilitator(accountUser1).then(function(result) {
            try {
              assert.equal(accountUser1.role, "accountManager");
              done()
            } catch (e) {
              done(e);
            }
          }, function(error) {
            done(error);
          });
        } catch (e) {
          done(e);
        }
      });
    });
  });

  describe('#acceptInvite', function() {
    describe('happy path', function() {
      it('should succeed and accept participant invite to the session', function (done) {

        let params = {
          accountUserId: accountUserWithUser.id,
          userId: accountUserWithUser.UserId,
          sessionId: session.id,
          accountId: accountUserWithUser.AccountId,
          role: 'participant'
        }
        inviteService.createInvite(params).then(function(invite) {
          inviteService.acceptInvite(invite.token).then((response) => {
            Invite.find({where: response.invite.id}).then((findInvite) => {
              AccountUser.find({where: response.invite.accountUserId, include: [SessionMember]}).then((accountUser) => {
                if (!findInvite) { return done("Invite not found")}
                if (!accountUser) { return done("Account User not found")}
                if (!accountUser.SessionMembers) { return done("Session Members for account user not found")}

                try {
                  assert.equal(accountUser.SessionMembers[0].sessionId, session.id);
                  assert.equal(accountUser.SessionMembers[0].role, invite.role);
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
    });
    describe('sad path', function() {
      it('should failed, session not found', function (done) {
        let params = {
          accountUserId: accountUserWithUser.id,
          userId: accountUserWithUser.UserId,
          sessionId: session.id,
          accountId: accountUserWithUser.AccountId,
          role: 'participant'
        }
        inviteService.createInvite(params).then(function(invite) {
          session.destroy().then(() => {
            inviteService.acceptInvite(invite.token).then(() => {
              done("should not get here!");
            }, function(error) {
              try {
                assert.equal(error, inviteService.messages.notFound)
                done();
              } catch (e) {
                done(e);
              }
            });
          })
        }, (error) => {
          done(error)
        });
      });
    });
  });

  describe('#removeInvite', function() {
    describe('happy path', function() {
      it('should succeed and remove invite and all dependencies', function (done) {

        let params = {
          accountUserId: accountUserWithUser.id,
          userId: accountUserWithUser.UserId,
          sessionId: session.id,
          accountId: accountUserWithUser.AccountId,
          role: 'participant'
        }
        inviteService.createInvite(params).then(function(invite) {
          inviteService.acceptInvite(invite.token).then((response) => {
            Invite.find({where: response.invite.id}).then((findInvite) => {
              inviteService.removeInvite(findInvite).then((result) => {
                AccountUser.find({where: findInvite.accountUserId, include: [SessionMember]}).then((accountUser) => {
                  try {
                    assert.isUndefined(accountUser.SessionMembers[0]);
                    assert.equal(accountUser.role, "participant");
                    assert.equal(accountUser.active, false);
                    done();
                  } catch (e) {
                    done(e);
                  }
                })
              });
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
