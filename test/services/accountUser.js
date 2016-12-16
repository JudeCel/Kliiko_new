'use strict';

var {sequelize, Session, AccountUser, User} = require('../../models');

var userService = require('../../services/users');
var sessionMemberService = require('../../services/sessionMember');
var inviteService = require('../../services/invite');
var accountUserService = require('../../services/accountUser');
var assert = require('chai').assert;
var async = require('async');


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
    sequelize.sync({ force: true }).then(() => {
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
      it("delete user without another role in the account", (done) =>{
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
          accountUserService.deleteOrRecalculate(newAccountUser2.id, newAccountUser2.AccountId).then(() => {
            AccountUser.find({where: {id: newAccountUser2.id}}).then((accountUser) => {
              try {
                assert.isNull(accountUser);
                done();
              } catch (e) {
                done(e);
              }
            })
          });
        })
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
              accountUserService.deleteOrRecalculate(newAccountUser2.id, newAccountUser2.AccountId).then(() => {
                AccountUser.find({where: {id: newAccountUser2.id}}).then((accountUser) => {
                  try {
                    assert.equal(accountUser.role, 'participant');
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
