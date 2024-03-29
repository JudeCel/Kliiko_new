'use strict';

var {Invite, sequelize, Session, AccountUser, Account} = require('../../../models');

var userService = require('../../../services/users');
var inviteService = require('../../../services/invite');
var accountManagerService = require('../../../services/accountManager');
var backgroundQueue = require('../../../services/backgroundQueue');
var inviteRoutes = require('../../../routes/root/invite.js');
var assert = require('chai').assert;
var testDatabase = require("../../database");

describe('ROUTE - Invite',() => {
  var testUser1, accountUser1, testUser2, session,
    testAccount1, accountUserWithoutUser, accountUserWithUser,
    accountUser2 = null

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

  beforeEach((done) => {
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
              backgroundQueue.setUpQueue(null, null, () => {
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
                    })
                  })
                })
              })
            })
          });
        })
      });
    });
  });

  describe('Index ', () =>  {
    it("new user", (done) => {
      let params = {
        accountUserId: accountUserWithoutUser.id,
        accountId: accountUserWithoutUser.AccountId,
        role: 'accountManager'
      }

      inviteService.createInvite(params).then(function(invite) {
        let next = () => { done("Should not call next function") }
        let req = {params: {token: invite.token }}
        let res = {
          render: (pathToView, _viewParams) => {
            try {
              assert.equal(pathToView, 'invite/newUser');
              done();
            } catch (e) {
              done(e);
            }
          }
        }

        try {
          inviteRoutes.index(req, res, next);
        } catch (e) {
          done(e);
        }
      }, function(error) {
        done(error);
      });
    })

    it("existing user", (done) => {
      let params = {
        accountUserId: accountUser2.id,
        userId: accountUser2.UserId,
        accountId: accountUser2.AccountId,
        role: 'accountManager'
      }

      inviteService.createInvite(params).then(function(invite) {
        let next = () => { done() }
        let req = {body: {}, params: {token: invite.token }}
        let res = {
          render: (pathToView, _viewParams) => {
            done("Should not call res.render function");
          }
        }

        try {
          inviteRoutes.index(req, res, next);
        } catch (e) {
          done(e);
        }
      }, function(error) {
        done(error);
      });
    })
  })

  describe('decline ', () =>  {
    it("success", (done) => {
      let params = {
        accountUserId: accountUserWithoutUser.id,
        accountId: accountUserWithoutUser.AccountId,
        role: 'accountManager'
      }

      inviteService.createInvite(params).then(function(invite) {
        let next = () => { done("Should not call next function") }
        let req = {
          params: { token: invite.token },
          flash: (key, message) => {
            assert.equal(key, 'message');
            assert.equal(message, inviteService.messages.declined);
          }
        }

        let res = {
          redirect: (path) => {
            assert.equal(path, '/login');
            done();
          }
        }

        try {
          inviteRoutes.decline(req, res, next);
        } catch (e) {
          done(e);
        }
      }, function(error) {
        done(error);
      });
    });
  });

  describe('accept ', () =>  {
    describe('hapy path ', () =>  {
      it("success", (done) => {
        let params = {
          accountUserId: accountUser2.id,
          accountId: accountUser2.AccountId,
          role: 'accountManager'
        }

        inviteService.createInvite(params).then((invite) => {
          let next = () => { done() }
          let req = {
            params: { token: invite.token },
            body: { password: "qwerty123" }
          }

          let res = {
            redirect: (path) => {
              assert.equal(path, '/login');
              done();
            }
          }

          try {
            inviteRoutes.accept(req, res, next);
          } catch (e) {
            done(e);
          }
        }, function(error) {
          done(error);
        });
      });
    })
    describe('sad path ', () =>  {
      it("no password ", (done) => {
        let params = {
          accountUserId: accountUserWithoutUser.id,
          accountId: accountUserWithoutUser.AccountId,
          role: 'accountManager'
        }

        inviteService.createInvite(params).then((invite) => {
          let next = () => { done("Should not call next function") }
          let req = {
            params: { token: invite.token }
          }

          let res = {
            render: (pathToView, _viewParams) => {
              assert.equal(pathToView, 'invite/newUser');
              done();
            }
          }

          try {
            inviteRoutes.accept(req, res, next);
          } catch (e) {
            done(e);
          }
        }, function(error) {
          done(error);
        });
      });
      it('try to accept invite that is already accepted ', (done) => {
        let params = {
          accountUserId: accountUserWithoutUser.id,
          accountId: accountUserWithoutUser.AccountId,
          role: 'accountManager',
        };

        inviteService.createInvite(params).then((invite) => {
          let next = () => {
            done('Should not call next function');
          };
          let req = {
            params: { token: invite.token },
          };

          let res = {
            render: (pathToView, _viewParams) => {
              assert.equal(pathToView, 'invite/newUser');
              done();
            },
          };

          try {
            inviteRoutes.accept(req, res, () => {
              let res = {
                redirect: (path) => {
                  assert.equal(path, '/login');
                  done();
                },
              };
              // if the Host clicks on Login a second time - they should land on the login screen
              inviteRoutes.accept(req, res, next);
            });
          } catch (e) {
            done(e);
          }
        }, function(error) {
          done(error);
        });
      });
    })
  });
});
