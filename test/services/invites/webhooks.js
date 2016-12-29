'use strict';

var {Invite, sequelize} = require('../../../models');

var userService = require('../../../services/users');
var inviteService = require('../../../services/invite');
var backgroundJobsInvite = require('../../../services/backgroundJobs/invites');
var assert = require('chai').assert;

describe('SERVICE - Invite Webhook', function() {
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

  describe('#processMailWebhook', () => {
    describe('happy path', () => {
      it('should succeed and update emailStatus to sent when delivered', (done) => {
        let params = {
          accountUserId: accountUser2.id,
          accountId: accountUser2.AccountId,
          role: 'accountManager'
        }

        inviteService.createInvite(params).then((invite) => {
          backgroundJobsInvite.sendInvite(invite.id, () => {
              let webhookParams = {
                "Message-Id": '<7fd443ff-d8a0-6fa0-ee5f-726935200fce@noreply.klzii.com>',
                event: "delivered"
              }
              inviteService.processMailWebhook(webhookParams).then(() => {
                Invite.find({where: {id: invite.id}}).then((inviteLastV) => {
                  try {
                    assert.equal(inviteLastV.emailStatus, "sent")
                    done();
                  } catch (e) {
                    done(e);
                  }
                })
              }, (error) => {
                done(error);
              })
          });
        }, (error) => {
          done(error);
        });
      });

      it('should succeed and update emailStatus to failed when dropped', (done) => {
        let params = {
          accountUserId: accountUser2.id,
          accountId: accountUser2.AccountId,
          role: 'accountManager'
        }

        inviteService.createInvite(params).then((invite) => {
          backgroundJobsInvite.sendInvite(invite.id, () => {
              let webhookParams = {
                "Message-Id": '<7fd443ff-d8a0-6fa0-ee5f-726935200fce@noreply.klzii.com>',
                event: "dropped",
                reason: "reason"
              }
              inviteService.processMailWebhook(webhookParams).then(() => {
                Invite.find({where: {id: invite.id}}).then((inviteLastV) => {
                  try {
                    assert.equal(inviteLastV.emailStatus, "failed")
                    assert.equal(inviteLastV.webhookMessage, webhookParams.reason)
                    assert.equal(inviteLastV.webhookEvent, "dropped")
                    assert.isNotNull(inviteLastV.webhookTime)
                    done();
                  } catch (e) {
                    done(e);
                  }
                })
              }, (error) => {
                done(error);
              })
          });
        }, (error) => {
          done(error);
        });
      });

      it('should succeed and update emailStatus to failed when bounced', (done) => {
        let params = {
          accountUserId: accountUser2.id,
          accountId: accountUser2.AccountId,
          role: 'accountManager'
        }

        inviteService.createInvite(params).then((invite) => {
          backgroundJobsInvite.sendInvite(invite.id, () => {
              let webhookParams = {
                "Message-Id": '<7fd443ff-d8a0-6fa0-ee5f-726935200fce@noreply.klzii.com>',
                event: "bounced",
                error: "error"
              }
              inviteService.processMailWebhook(webhookParams).then(() => {
                Invite.find({where: {id: invite.id}}).then((inviteLastV) => {
                  try {
                    assert.equal(inviteLastV.emailStatus, "failed")
                    assert.equal(inviteLastV.webhookMessage, webhookParams.error)
                    assert.equal(inviteLastV.webhookEvent, webhookParams.event)
                    assert.isNotNull(inviteLastV.webhookTime)
                    done();
                  } catch (e) {
                    done(e);
                  }
                })
              }, (error) => {
                done(error);
              })
          });
        }, (error) => {
          done(error);
        });
      });
    });
  });
});
