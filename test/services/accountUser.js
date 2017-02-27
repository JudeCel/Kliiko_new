'use strict';
const TransactionPool = require('../../lib/transactionPool');
var {sequelize, Session, AccountUser, User} = require('../../models');
sequelize.transactionPool = new TransactionPool();

var userService = require('../../services/users');
var sessionMemberService = require('../../services/sessionMember');
var inviteService = require('../../services/invite');
var accountUserService = require('../../services/accountUser');
var assert = require('chai').assert;
var async = require('async');
var testDatabase = require("../database");


describe('SERVICE - AccountUser with DB', function() {
  var testUser1, accountUser1, testUser, testAccount1, accountUser2 = null;

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
        user1.getOwnerAccount().then((accounts) =>  {
          accountUser1 = accounts[0].AccountUser
          userService.create(user2Attrs, (err, user2) =>  {
            user2.getAccountUsers().then( (results) => {
              accountUser2 = results[0],
              done();
            })
          });
        })
      });
    });
  });

  describe('#deleteOrRecalculate', () => {
    describe("when only one record", () => {
      it("set lower role in system if no other roles", (done) =>{
        let accountUserParams2 ={
          email: "dainis@gmail.com",
          AccountId: accountUser2.AccountId,
          firstName: "Dainis",
          lastName: "Lapins",
          gender: "male",
          "role": "observer",
          active: false
        }

        AccountUser.create(accountUserParams2).then((newAccountUser2) => {
          accountUserService.deleteOrRecalculate(newAccountUser2.id).then(() => {
            AccountUser.find({where: {id: newAccountUser2.id}}).then((accountUser) => {
              try {
                assert.equal(accountUser.role, 'observer');
                assert.equal(accountUser.isRemoved, false);
                done();
              } catch (e) {
                done(e);
              }
            })
          });
        })
      });
    });

    describe('when removing admin role', () => {
      it('should set "isRemoved" flag to true if account has only admin role', (done) => {
        let params = {
          email: "dainis@gmail.com",
          AccountId: accountUser2.AccountId,
          firstName: "Dainis",
          lastName: "Lapins",
          gender: "male",
          "role": "admin",
          active: true
        };

        AccountUser.create(params).then((newAccountUser2) => {
          accountUserService.deleteOrRecalculate(newAccountUser2.id, null, 'admin').then(() => {
            AccountUser.find({where: {id: newAccountUser2.id}}).then((accountUser) => {
              try {
                assert.equal(accountUser.isRemoved, true);
                done();
              } catch (e) {
                done(e);
              }
            })
          });
        })
      });

      it('should set "isRemoved" flag to false if account user has admin and other roles', (done) => {
        let params ={
          email: "dainis@gmail.com",
          AccountId: accountUser2.AccountId,
          firstName: "Dainis",
          lastName: "Lapins",
          gender: "male",
          "role": "admin",
          active: true
        };

        let sessionParams = {
          name: "Test session",
          step: 'setUp',
          startTime: new Date,
          endTime: new Date,
          accountId:  accountUser2.AccountId,
          type: "focus",
          timeZone: 'America/Anchorage'
        };

        AccountUser.create(params).then((newAccountUser2) => {
          Session.create(sessionParams).then((session) =>  {
            let sessionMemberParams = {
              username: "Participant 2",
              accountUserId: newAccountUser2.id,
              sessionId: session.id,
              role: 'participant'
            }
            sessionMemberService.createWithTokenAndColour(sessionMemberParams).then(() => {
              accountUserService.deleteOrRecalculate(newAccountUser2.id, null, 'admin').then(() => {
                AccountUser.find({where: {id: newAccountUser2.id}}).then((accountUser) => {
                  try {
                    assert.equal(accountUser.isRemoved, false);
                    done();
                  } catch (e) {
                    done(e);
                  }
                });
              });
            }, (error) => {
              done(error);
            });
          });
        });
      });
    });

    describe("when multiple roles in account", () => {
      it("recalculate role, not delete record for user", (done) =>{
        let accountUserParams2 ={
          email: "dainis@gmail.com",
          AccountId: accountUser2.AccountId,
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
          accountId: accountUser2.AccountId,
          type: "focus",
          timeZone: 'America/Anchorage'
        }
        AccountUser.create(accountUserParams2).then((newAccountUser2) => {
          Session.create(sessionParams).then((session) =>  {
            let sessionMemberParams = {
              username: "Participant 2",
              accountUserId: newAccountUser2.id,
              sessionId: session.id,
              role: 'participant'
            }
            sessionMemberService.createWithTokenAndColour(sessionMemberParams).then(() => {
              accountUserService.deleteOrRecalculate(newAccountUser2.id).then(() => {
                AccountUser.find({where: {id: newAccountUser2.id}}).then((accountUser) => {
                  try {
                    assert.equal(accountUser.role, 'participant');
                    assert.equal(accountUser.isRemoved, false);
                    done();
                  } catch (e) {
                    done(e);
                  }
                });
              });
            }, (error) => {
              done(error);
            });
          });
        });
      });
    });
  });
});
