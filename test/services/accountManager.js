'use strict';

var models = require('./../../models');
var Invite = models.Invite;
var User = models.User;
var Account = models.Account;
var AccountUser = models.AccountUser;

var userService = require('./../../services/users');
var inviteService = require('./../../services/invite');
var accountManagerService = require('./../../services/accountManager');
var userFixture = require('./../fixtures/user');
var subscriptionFixture = require('./../fixtures/subscription');
var testDatabase = require("../database");

var assert = require('chai').assert;
var async = require('async');

var testData;

describe('SERVICE - AccountManager', function() {
  beforeEach(function(done) {
    testDatabase.prepareDatabaseForTests().then(function() {
      userFixture.createUserAndOwnerAccount().then(function(result) {
        testData = result;
        done();
      }).catch(function(error) {
        done(error);
      });
    });
  });

  function countTables(params) {
    return [
      function(cb) {
        Invite.count().then(function(c) {
          try {
            assert.equal(c, params.invite);
              cb();
          } catch (e) {
            cb(e);
          }
        });
      },
      function(cb) {
        Account.count().then(function(c) {
          try {
            assert.equal(c, params.account);
            cb();
          } catch (e) {
            cb(e);
          }
        });
      },
      function(cb) {
        User.count().then(function(c) {
          try {
            assert.equal(c, params.user);
            cb();
          } catch (e) {
            cb(e);
          }
        });
      },
      function(cb) {
        AccountUser.count().then(function(c) {
          try {
            assert.equal(c, params.accountUser);
            cb();
          } catch (e) {
            cb(e);
          }
        });
      }
    ];
  }

  function sampleData(params) {
    let newParams = params || {};

    return {
      accountId: testData.account.id,
      role: 'accountManager',
      user: { id: testData.user.id, email: testData.user.email },
      body: {
        firstName: 'FirstName',
        lastName: 'LastName',
        gender: 'male',
        email: 'some@email.com'
      }
    }
  }

  describe('#createOrFindAccountManager', function() {
    describe('happy path', function() {
      it('should create new account user', function(done) {
        let data = sampleData();
        subscriptionFixture.createSubscription(testData.account.id, testData.user.id).then(function(subscription) {
          models.SubscriptionPreference.update({'data.accountUserCount': 5}, { where: { subscriptionId: subscription.id } }).then(function() {
            accountManagerService.createOrFindAccountManager(data.user, data.body, data.accountId).then(function(params) {
              AccountUser.find({ where: { email: data.body.email } }).then(function(accountUser) {
                try {
                  assert.equal(accountUser.AccountId, params.accountId);
                  assert.equal(accountUser.id, params.accountUserId);
                  assert.equal(accountUser.role, "accountManager");
                  done();
                } catch (e) {
                  done(e);
                }
              });
            }, function(error) {
              done(error);
            });
          }, function(error) {
            done(error);
          })
        }, function(error) {
          done(error);
        });
      });
    });

    describe('sad path', function() {
      it('should fail because of inviting himself', function (done) {
        let data = sampleData();
        data.user.email = data.body.email;

        subscriptionFixture.createSubscription(testData.account.id, testData.user.id).then(function(subscription) {
          models.SubscriptionPreference.update({'data.accountUserCount': 5}, { where: { subscriptionId: subscription.id } }).then(function() {
            accountManagerService.createOrFindAccountManager(data.user, data.body, data.accountId).then(function(params) {
              done('Should not get here!');
            }, function(error) {
              assert.deepEqual(error, { email: 'You are trying to invite yourself.' });
              done();
            });
          }, function(error) {
            done(error);
          })
        },   function(error) {
          done(error);
        })
      });

      it('should fail because of already accepted', function (done) {
        let data = sampleData();
        data.user.id = testData.user.id + 99;
        data.user.email = 'other@mail.com';
        data.body.email = testData.user.email;

        subscriptionFixture.createSubscription(testData.account.id, testData.user.id).then(function(subscription) {
          models.SubscriptionPreference.update({'data.accountUserCount': 5}, { where: { subscriptionId: subscription.id } }).then(function() {
            accountManagerService.createOrFindAccountManager(data.user, data.body, data.accountId).then(function(params) {
              done('Should not get here!');
            }, function(error) {
              assert.deepEqual(error.email, "This user is already invited.");
              done();
            });
          }, function(error) {
            done(error);
          })
        },   function(error) {
          done(error);
        });
      });
    });
  });

  describe('#findAccountManagers', function() {
    it('should find accepted user', function (done) {
      let data = sampleData();

      subscriptionFixture.createSubscription(testData.account.id, testData.user.id).then(function(subscription) {
        models.SubscriptionPreference.update({'data.accountUserCount': 5}, { where: { subscriptionId: subscription.id } }).then(function() {
          accountManagerService.createOrFindAccountManager(data.user, data.body, data.accountId).then(function(params) {
            try {
              inviteService.createInvite(params).then((invite) => {
                let userParams = { password: 'newpassword' };
                inviteService.acceptInvite(invite.token, userParams).then(({invite, user, message}) => {
                  async.parallel(countTables({ invite: 1, account: 1, user: 2, accountUser: 2 }), function(error, result) {
                    if(error) {
                      done(error);
                    }
                    accountManagerService.findAccountManagers(data.accountId).then(function(results) {
                      let subject = results[0];
                      try {
                        assert.equal(subject.status, 'active');
                        assert.equal(subject.AccountId, data.accountId);
                        done();
                      } catch (e) {
                        done(e);
                      }

                    }, function(error) {
                      done(error);
                    });
                  });
                }, (error) => {
                  done(error);
                });
              }, (error) => {
                done(error);
              });
            } catch (e) {
              done(e);
            }
          }, function(error) {
            done(error);
          });
        }, function(error) {
          done(error);
        })
      }, function(error) {
        done(error);
      });
    });

    it('should find invited user', function (done) {
      let data = sampleData();
      subscriptionFixture.createSubscription(testData.account.id, testData.user.id).then(function(subscription) {
        models.SubscriptionPreference.update({'data.accountUserCount': 5}, { where: { subscriptionId: subscription.id } }).then(function() {
          accountManagerService.createOrFindAccountManager(data.user, data.body, data.accountId).then(function(params) {
            inviteService.createInvite(params).then(function(result) {
              async.parallel(countTables({ invite: 1, account: 1, user: 1, accountUser: 2 }), function(error, result) {
                if(error) {
                  done(error);
                }

                accountManagerService.findAccountManagers(data.accountId).then(function(result) {
                  let subject = result[1];
                  assert.equal(subject.status, 'invited');
                  assert.equal(subject.AccountId, data.accountId);
                  done();
                }, function(error) {
                  done(error);
                });
              });
            }, function(error) {
              done(error);
            });
        }, function(error) {
          done(error);
        })
        }, function(error) {
          done(error);
        });
      }, function(error) {
        done(error);
      });
    });
  });

  describe('#findAndRemoveAccountUser', function() {
    it('should remove account from list', function (done) {
      let data = sampleData();

      subscriptionFixture.createSubscription(testData.account.id, testData.user.id).then(function(subscription) {
        models.SubscriptionPreference.update({'data.accountUserCount': 5}, { where: { subscriptionId: subscription.id } }).then(function() {
          accountManagerService.createOrFindAccountManager(data.user, data.body, data.accountId).then(function(params) {
            AccountUser.find({ where: { email: data.body.email } }).then(function(accountUser) {
              inviteService.createInvite(params).then(function(result) {
                let userParams = { accountName: 'newname', password: 'newpassword' };
                inviteService.acceptInvite(result.token, userParams).then((error, message) => {
                  async.parallel(countTables({ invite: 1, account: 1, user: 2, accountUser: 2 }), function(error, result) {
                    if(error) {
                      done(error);
                    }

                    accountManagerService.findAndRemoveAccountUser(accountUser.id, data.accountId).then(function(message) {
                      assert.equal(message, 'Successfully removed account from Account List');

                      async.parallel(countTables({ invite: 1, account: 1, user: 2, accountUser: 2 }), function(error, result) {
                        done(error);
                      });
                    }, function(error) {
                      done(error);
                    });
                  });
                }, (error) => {
                  done(error);
                });
              });
            });
          }, function(error) {
            done(error);
          });
        }, function(error) {
          done(error);
        })
      }, function(error) {
        done(error);
      });
    });
  });
});
