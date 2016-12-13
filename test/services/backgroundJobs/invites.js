'use strict';

var {Invite, sequelize} = require('../../../models');

var userService = require('../../../services/users');
var inviteService = require('../../../services/invite');
var backgroundJobsInvite = require('../../../services/backgroundJobs/invites');
var assert = require('chai').assert;
var async = require('async');


describe.only('Background Jobs - Invites', function() {
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
              done();
            })
          });
        })
      });
    });
  });

  function getDefaultParams(accountUser, role) {
    return {
      accountUserId: accountUser.id,
      userId: accountUser.UserId,
      accountId: accountUser.AccountId,
      role: role
    }
  }

  describe("#sendInvite", () => {
    it("succsess", (done) => {

      inviteService.createInvite(getDefaultParams(accountUser2, "accountManager")).then(function(invite) {
        backgroundJobsInvite.sendInvite(invite.id, () => {
          Invite.find({where: {id: invite.id}}).then((updateInvite) => {
            try {
              assert.equal(updateInvite.emailStatus, "sent")
              done();
            } catch (e) {
              done(e);
            }
          })
        }, (error) => {
          done(error);
        });
      });
    });

    it("failed invite not found", (done) => {
      inviteService.createInvite(getDefaultParams(accountUser2, "accountManager")).then(function(invite) {
        backgroundJobsInvite.sendInvite(invite.id + 3, (error) => {
          try {
            assert.equal(error, inviteService.messages.notFound);
            done()
          } catch (e) {
            done(e)
          }
        });
      });
    })
  })
});
