'use strict';

var {Invite, sequelize, Session} = require('./../../models');

var userService = require('./../../services/users');
var inviteService = require('./../../services/invite');
var accountManagerService = require('./../../services/accountManager');
var backgroundQueue = require('./../../services/backgroundQueue');
var subscriptionFixture = require('./../fixtures/subscription');
var assert = require('chai').assert;
var async = require('async');

describe.only('SERVICE - Invite', function() {
  var testUser, accountUser, testUser2, testAccount, session, accountUser2 = null;
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
                let sessionParams = {
                  name: "Test session",
                  step: 'setUp',
                  startTime: new Date,
                  endTime: new Date,
                  accountId: testAccount.id,
                  type: "focus",
                  timeZone: 'America/Anchorage'
                }

                Session.create(sessionParams).then((result) =>  {
                  session = result;
                  done();
                }, (error) => {
                  done(error);
                })
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
          role: 'facilitator',
          userType: "existing"
        }

        inviteService.createInvite(params).then(function(invite) {
          try {
            assert.equal(invite.userId, params.userId);
            assert.equal(invite.role, params.role);
            assert.equal(invite.userType, params.userType);
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
            role: 'facilitator',
            userType: "existing"
          },
          {
            role: 'facilitator',
            userType: "existing"
          },{
            role: 'participant',
            userType: "new"
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
          role: 'facilitator',
          userType: "existing"
        }]

        inviteService.createBulkInvites(params).then(function(invites) {
          try {
            assert.equal(invites[0].userId, params[0].userId);
            assert.equal(invites[0].role, params[0].role);
            assert.equal(invites[0].userType, params[0].userType);
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
          role: 'facilitator',
          userType: "existing"
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
          sessionId: session.id,
          userType: "existing"
        }

        inviteService.createFacilitatorInvite(params).then(function() {
            done();
        }, function(error) {
          done(error);
          });
      });
    });
  });

  // describe('#removeInvite', function() {
  //   describe('existing user', function() {
  //     it('should succeed on removing invite', function (done) {
  //       let body = {firstName: accountUser2.firstName,
  //         lastName: accountUser2.lastName,
  //         gender: accountUser2.gender,
  //         email: accountUser2.email
  //       };
  //
  //       subscriptionFixture.createSubscription(testAccount.id, testUser.id).then(function(subscription) {
  //         models.SubscriptionPreference.update({'data.accountUserCount': 5}, { where: { subscriptionId: subscription.id } }).then(function() {
  //           validParams(testUser, testAccount, body).then(function(params) {
  //             inviteService.createInvite(params).then(function(data) {
  //               async.parallel(countTables({ invite: 1, account: 2, user: 2, accountUser: 3 }), function(error, result) {
  //                 if(error) {
  //                   done(error);
  //                 }
  //
  //                 inviteService.removeInvite(data.invite, function(error, result) {
  //                   if(error) {
  //                     done(error);
  //                   }
  //
  //                   assert.equal(result, inviteService.messages.removed);
  //                   async.parallel(countTables({ invite: 0, account: 2, user: 2, accountUser: 3 }), function(error, result) {
  //                     done(error);
  //                   });
  //                 });
  //               });
  //             }, function(error) {
  //               done(error);
  //             });
  //           }, function(error) {
  //             done(error);
  //           });
  //         }, function(error) {
  //           done(error);
  //         })
  //       }, function(error) {
  //         done(error);
  //       });
  //     });
  //
  //     it('should fail on removing invite because confirmed', function (done) {
  //       let body = {firstName: accountUser2.firstName,
  //         lastName: accountUser2.lastName,
  //         gender: accountUser2.gender,
  //         email: accountUser2.email
  //       };
  //
  //       subscriptionFixture.createSubscription(testAccount.id, testUser.id).then(function(subscription) {
  //         models.SubscriptionPreference.update({'data.accountUserCount': 5}, { where: { subscriptionId: subscription.id } }).then(function() {
  //           validParams(testUser, testAccount, body).then(function(params) {
  //             inviteService.createInvite(params).then(function(data) {
  //               Invite.update({ status: 'confirmed' }, { where: { id: data.invite.id } }).then(function() {
  //                 async.parallel(countTables({ invite: 1, account: 2, user: 2, accountUser: 3 }), function(error, result) {
  //                   if(error) {
  //                     done(error);
  //                   }
  //
  //                   inviteService.removeInvite(data.invite, function(error, result) {
  //                     assert.equal(error, inviteService.messages.cantRemove);
  //                     async.parallel(countTables({ invite: 1, account: 2, user: 2, accountUser: 3 }), function(error, result) {
  //                       done(error);
  //                     });
  //                   });
  //                 });
  //               });
  //             }, function(error) {
  //               done(error);
  //             });
  //           }, function(error) {
  //             done(error);
  //           });
  //         }, function(error) {
  //           done(error);
  //         })
  //       }, function(error) {
  //         done(error);
  //       });
  //
  //     });
  //   });
  //
  //   describe('new user', function() {
  //     it('should succeed on removing invite', function (done) {
  //       let body = {firstName: "newName",
  //         lastName: "newlastName",
  //         gender: "male",
  //         email: "newuser@gmail.com"
  //       };
  //
  //       subscriptionFixture.createSubscription(testAccount.id, testUser.id).then(function(subscription) {
  //         models.SubscriptionPreference.update({'data.accountUserCount': 5}, { where: { subscriptionId: subscription.id } }).then(function() {
  //           validParams(testUser, testAccount, body).then(function(params) {
  //             inviteService.createInvite(params).then(function(data) {
  //               async.parallel(countTables({ invite: 1, account: 2, user: 3, accountUser: 3 }), function(error, result) {
  //                 if(error) {
  //                   done(error);
  //                 }
  //
  //                 inviteService.removeInvite(data.invite, function(error, result) {
  //                   if(error) {
  //                     done(error);
  //                   }
  //
  //                   assert.equal(result, inviteService.messages.removed);
  //                   async.parallel(countTables({ invite: 0, account: 2, user: 2, accountUser: 2 }), function(error, result) {
  //                     done(error);
  //                   });
  //                 });
  //               });
  //             }, function(error) {
  //               done(error);
  //             });
  //           }, function(error) {
  //             done(error);
  //           });
  //         }, function(error) {
  //           done(error);
  //         })
  //       }, function(error) {
  //         done(error);
  //       });
  //
  //     });
  //   });
  // // });

  // describe('#findInvite', function() {
  //   it('should succeed on finding invite', function (done) {
  //     let body = {firstName: "newName",
  //       lastName: "newlastName",
  //       gender: "male",
  //       email: "newuser@gmail.com"
  //     }
  //
  //     subscriptionFixture.createSubscription(testAccount.id, testUser.id).then(function(subscription) {
  //       models.SubscriptionPreference.update({'data.accountUserCount': 5}, { where: { subscriptionId: subscription.id } }).then(function() {
  //         validParams(testUser, testAccount, body).then(function(params) {
  //           inviteService.createInvite(params).then(function(data) {
  //             inviteService.findInvite(data.invite.token, function(error, result) {
  //               assert.equal(error, null);
  //               assert.equal(data.invite.id, result.id);
  //               done();
  //             });
  //           }, function(error) {
  //             done(error);
  //           });
  //         }, function(error) {
  //           done(error);
  //         });
  //       }, function(error) {
  //         done(error);
  //       })
  //     }, function(error) {
  //       done(error);
  //     });
  //
  //   });
  //
  //   it('should fail on finding invite', function (done) {
  //     inviteService.findInvite('some token', function(error, result) {
  //       assert.equal(error, 'Invite not found');
  //       assert.equal(result, null);
  //       done();
  //     });
  //   });
  // });

  // describe('#declineInvite', function() {
  //   it('should succeed on declining invite', function (done) {
  //     let body = {firstName: "newName",
  //       lastName: "newlastName",
  //       gender: "male",
  //       email: "newuser@gmail.com"
  //     };
  //
  //     subscriptionFixture.createSubscription(testAccount.id, testUser.id).then(function(subscription) {
  //       models.SubscriptionPreference.update({'data.accountUserCount': 5}, { where: { subscriptionId: subscription.id } }).then(function() {
  //         validParams(testUser, testAccount, body).then(function(params) {
  //           inviteService.createInvite(params).then(function(data) {
  //             inviteService.declineInvite(data.invite.token, function(error, result, message) {
  //               assert.equal(error, null);
  //               assert.equal(data.invite.id, result.id);
  //               assert.equal(message, inviteService.messages.declined);
  //               done();
  //             });
  //           }, function(error) {
  //             done(error);
  //           });
  //         }, function(error) {
  //           done(error);
  //         });
  //       }, function(error) {
  //         done(error);
  //       })
  //     }, function(error) {
  //       done(error);
  //     });
  //
  //   });
  // });

  // describe('#acceptInviteExisting', function() {
  //   it('should succeed on accepting invite', function (done) {
  //     let body = {firstName: accountUser2.firstName,
  //       lastName: accountUser2.lastName,
  //       gender: accountUser2.gender,
  //       email: accountUser2.email
  //     };
  //
  //     subscriptionFixture.createSubscription(testAccount.id, testUser.id).then(function(subscription) {
  //       models.SubscriptionPreference.update({'data.accountUserCount': 5}, { where: { subscriptionId: subscription.id } }).then(function() {
  //         validParams(testUser, testAccount, body).then(function(params) {
  //           inviteService.createInvite(params).then(function(data) {
  //             async.parallel(countTables({ invite: 1, account: 2, user: 2, accountUser: 3 }), function(error, result) {
  //               if(error) {
  //                 done(error);
  //               }
  //
  //               inviteService.acceptInviteExisting(data.invite.token, function(error, _result, message) {
  //                 if(error) {
  //                   done(error);
  //                 }
  //                 async.parallel(countTables({ invite: 1, account: 2, user: 2, accountUser: 3 }), function(error, result) {
  //                   Invite.find({ where: { id: data.invite.id } }).then(function(invite) {
  //                     assert.equal(invite.status, 'confirmed');
  //                     done(error);
  //                   });
  //                 });
  //               });
  //             });
  //           }, function(error) {
  //             done(error);
  //           });
  //         }, function(error) {
  //           done(error);
  //         });
  //       }, function(error) {
  //         done(error);
  //       })
  //     }, function(error) {
  //       done(error);
  //     });
  //   });
  // });

  // describe('#acceptInviteNew', function() {
  //   it('should succeed on accepting invite', function (done) {
  //     let body = { firstName: "newName",
  //       lastName: "newlastName",
  //       gender: "male",
  //       email: "newuser@gmail.com"
  //     };
  //
  //     subscriptionFixture.createSubscription(testAccount.id, testUser.id).then(function(subscription) {
  //       models.SubscriptionPreference.update({'data.accountUserCount': 5}, { where: { subscriptionId: subscription.id } }).then(function() {
  //         validParams(testUser, testAccount, body).then(function(params) {
  //           inviteService.createInvite(params).then(function(data) {
  //             let oldPassword = data.invite.User.encryptedPassword;
  //
  //             async.parallel(countTables({ invite: 1, account: 2, user: 3, accountUser: 3 }), function(error, result) {
  //               if(error) {
  //                 done(error);
  //               }
  //
  //               let userParams = { accountName: 'newname', password: 'newpassword' };
  //               inviteService.acceptInviteNew(data.invite.token, userParams, function(error, message) {
  //                 if(error) {
  //                   done(error);
  //                 }
  //
  //                 data.invite.User.reload().then(function(user) {
  //                   assert.notEqual(user.encryptedPassword, oldPassword);
  //
  //                   user.getAccounts().then(function(accounts) {
  //                     assert.equal(accounts[0].name, testAccount.name);
  //                     async.parallel(countTables({ invite: 1, account: 2, user: 3, accountUser: 3 }), function(error, result) {
  //                       Invite.find({ where: { id: data.invite.id } }).then(function(invite) {
  //                         assert.equal(invite.status, 'confirmed');
  //                         done(error);
  //                       });
  //                     });
  //                   });
  //                 });
  //               });
  //             });
  //           }, function(error) {
  //             done(error);
  //           });
  //         }, function(error) {
  //           done(error);
  //         });
  //       }, function(error) {
  //         done(error);
  //       })
  //
  //     }, function(error) {
  //       done(error);
  //     });
  //
  //   });
  // });

});
