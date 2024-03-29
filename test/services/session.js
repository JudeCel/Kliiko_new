'use strict';

var models = require('./../../models');
var Session = models.Session;
var SessionMember = models.SessionMember;
var AccountUser = models.AccountUser;

var sessionServices = require('./../../services/session');
var sessionFixture = require('./../fixtures/session');
var subscriptionFixture = require('./../fixtures/subscription');
var sessionBuilderServices = require('./../../services/sessionBuilder');
var testDatabase = require("../database");

var assert = require('chai').assert;
describe('SERVICE - Session', function() {
  describe('#canChangeAnonymous', function() {
    it('when session is anonymous', function (done) {
      let tmpSession = {anonymous: true}
      let result = sessionServices.canChangeAnonymous(tmpSession)
      try {
        assert.equal(result, false);
        done()
      } catch (e) {
        done(e)
      }
     });
  })
  describe('Session with DB call', function() {
    var testData = {};

    beforeEach(function(done) {
      testDatabase.prepareDatabaseForTests().then(() => {
        sessionFixture.createChat({ participants: 2 }).then(function(result) {
          testData = result;
          testData.session = result.session
          done();
        }, function(error) {
          done(error);
        });
      });
    });

    function accountParams() {
      return { id: testData.account.id, roles: ['accountManager'] };
    };

    describe('#setAnonymous', function() {
      it('change to anonymous true', function (done) {
        sessionServices.setAnonymous(testData.session.id, testData.session.accountId).then((session) => {
          try {
            assert.equal(session.anonymous, true);
            done()
          } catch (e) {
            done(e)
          }
        }, function(error) {
          done(error)
        })
      });
    })

    describe('#findSession', function() {
      describe('happy path', function() {
        it('should succeed on finding session', function (done) {
          sessionServices.findSession(testData.session.id, testData.account.id).then(function(result) {
            assert.equal(result.data.accountId, testData.account.id);
            done();
          }, function(error) {
            done(error);
          });
        });
      });

      describe('sad path', function() {
        it('should fail on finding session', function (done) {
          sessionServices.findSession(testData.session.id + 100, testData.account.id).then(function(result) {
            done('Should not get here!');
          }, function(error) {
            assert.equal(error, sessionServices.messages.notFound);
            done();
          });
        });
      });
    });

    describe('#findAllSessions', function() {
      describe('happy path', function() {
        it('should succeed on finding all sessions', function (done) {
          sessionServices.findAllSessions(testData.user.id, testData.accountUser, testData.account).then(function(result) {
            try {
              assert.equal(result.data[0].accountId, testData.account.id);
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

    describe('#checkSessionByPublicUid', function() {
      it('should succeed', function (done) {
        models.Session.update({publicUid: "test-uid", type: "socialForum"}, { where: { id: testData.session.id } }).then(function() {
          sessionServices.checkSessionByPublicUid("test-uid").then(function(result) {
            done();
          }, function(error) {
            done(error);
          });
        }, function(error) {
          done(error);
        });
      });

      it('should fail', function (done) {
        sessionServices.checkSessionByPublicUid("fake-uid").then(function(result) {
          done('Should not get here!');
        }, function(error) {
          assert.equal(error, sessionServices.messages.notFound);
          done();
        });
      });

      it('should fail because closed', function (done) {
        models.Session.update({publicUid: "test-uid", type: "socialForum", status: "closed"}, { where: { id: testData.session.id } }).then(function() {
          sessionServices.checkSessionByPublicUid("test-uid").then(function(result) {
            done('Should not get here!');
          }, function(error) {
            assert.equal(error, sessionServices.messages.closed.replace("{sessionName}", testData.session.name));
            done();
          });
        }, function(error) {
          done(error);
        });
      });
    });

    describe('#setOpen)', function(done) {
      describe('happy path', function(done) {
        it('should open', function(done) {
          // there is the open session
          // close the existing open session
          sessionServices.setOpen(testData.session.id, false, testData.session.accountId).then(function() {
            //try to open it
          sessionServices.setOpen(testData.session.id, true, testData.session.accountId).then(function(result) {
            assert.deepEqual(result, { data: { status: "open", showStatus: "Pending" } });
            models.Session.find({ where: { id: testData.session.id } }).then(function(session) {
              assert.equal(session.status, "open");
              done();
            }, function(error) {
              done(error);
            });
          }, function(error) {
            done(error);
          });
        }, function(error) {
          done(error);
        });
        });

        it('should close', function(done) {
          // there is the open session
          // try to close it
          sessionServices.setOpen(testData.session.id, false, testData.session.accountId).then(function(result) {
            assert.deepEqual(result, { data: { status: "closed", showStatus: "Closed" } });
            models.Session.find({ where: { id: testData.session.id } }).then(function(session) {
              assert.equal(session.status, "closed");
              done();
            }, function(error) {
              done(error);
            });
          }, function(error) {
            done(error);
          });
        });
      });
    });

    describe('#removeSession', function() {
      describe('happy path', function() {
        it('should succeed on deleting session', function (done) {
          Session.count().then(function(c) {
            assert.equal(c, 1);

            sessionServices.removeSession(testData.session.id, testData.account.id).then(function(result) {
              assert.equal(result.message, sessionServices.messages.removed);

              Session.count().then(function(c) {
                assert.equal(c, 0);
                done();
              });
            }, function(error) {
              done(error);
            });
          });
        });

        it('should reset accountUser role on deleting session', function (done) {
          Session.count().then(function(c) {
            assert.equal(c, 1);

            SessionMember.findAll().then(function(members) {
              assert.equal(members.length, 4);
              assert.equal(members[1].role, 'participant');
              let accountUserId = members[1].accountUserId;

              AccountUser.find({ where: { id: accountUserId} }).then(function(accountUser) {
              assert.equal(accountUser.role, 'participant');

                sessionServices.removeSession(testData.session.id, testData.account.id).then(function(result) {
                  assert.equal(result.message, sessionServices.messages.removed);

                  AccountUser.find({ where: { id: accountUserId} }).then(function(accountUserRes) {
                    assert.equal(accountUserRes.role, 'observer');
                    done();
                  });
                }, function(error) {
                  done(error);
                });

              });
            });
          });
        });
      });

      describe('sad path', function() {
        it('should fail because not found', function (done) {
          sessionServices.removeSession(testData.session.id + 100, testData.account.id).then(function(result) {
            done('Should not get here!');
          }, function(error) {
            assert.equal(error, sessionServices.messages.notFound);
            done();
          });
        });
      });
    });

    describe('#copySession', function() {
      describe('happy path', function() {
        it('should succeed on copieing session', function (done) {
          models.SubscriptionPreference.update({'data.sessionCount': 2}, { where: { subscriptionId: testData.subscription.id } }).then(function(result) {
            Session.count().then(function(c) {
              assert.equal(c, 1);

              sessionServices.copySession(testData.session.id, testData.account.id).then(function(result) {
                assert.equal(result.message, sessionServices.messages.copied);

                Session.count().then(function(c) {
                  assert.equal(c, 2);
                  done();
                });
              }, function(error) {
                done(error);
              });
            });
          }, function(error) {
            done(error);
          })
        });
      });

      describe('sad path', function() {
        it('should fail because not found', function (done) {
          models.SubscriptionPreference.update({'data.sessionCount': 2}, { where: { subscriptionId: testData.subscription.id } }).then(function(result) {
            sessionServices.copySession(testData.session.id + 100, testData.account.id).then(function(result) {
              done('Should not get here!');
            }, function(error) {
              assert.equal(error, sessionServices.messages.notFound);
              done();
            });
          }, function(error) {
            done(error);
          })
        });
      });
    });

    describe('#updateSessionMemberRating', function() {
      describe('happy path', function() {
        it('should succeed on updating rating', function (done) {
          sessionBuilderServices.update(testData.session.id, testData.session.accountId, {status: 'closed'}).then(function(closeResult) {
            models.SessionMember.find({ where: { role: 'participant' } }).then(function(member) {
              let params = { id: member.id, rating: 4 };
              models.SessionMember.find({
                where: {
                  role: 'facilitator'
                },
                include: [models.AccountUser]
              }).then(function(member) {
                sessionServices.updateSessionMemberRating(params, member.AccountUser.UserId, testData.account.id).then(function(result) {
                  assert.equal(result.data.rating, 4);
                  assert.equal(result.message, sessionServices.messages.rated);
                  done();
                }, function(error) {
                  done(error);
                });
              });
            });
          }, function(error) {
            done(error);
          });
        });
      });

      describe('sad path', function() {
        it('should fail because session not closed', function (done) {
          models.SessionMember.find({ where: { role: 'participant' } }).then(function(member) {
            let params = { id: member.id, rating: 4 };
            models.SessionMember.find({
              where: {
                role: 'facilitator'
              },
              include: [models.AccountUser]
            }).then(function(member) {
              sessionServices.updateSessionMemberRating(params, member.AccountUser.UserId, testData.account.id).then(function(result) {
                done('Should not get here!');
              }, function(error) {
                assert.equal(error, sessionServices.messages.sessionNotClosed);
                done();
              });
            })
          });
        });

        it('should fail because not found', function (done) {
          sessionServices.findSession(testData.session.id, testData.account.id).then(function(result) {
            let params = { id: result.data.dataValues.facilitator.id + 100, rating: 4 };
            sessionServices.updateSessionMemberRating(params, testData.user.id, testData.account.id).then(function(result) {
              done('Should not get here!');
            }, function(error) {
              assert.equal(error, sessionServices.messages.sessionMemberNotFound);
              done();
            });
          });
        });
      });
    });

    describe('#changeComment', function() {
      describe('happy path', function() {
        it('should succeed on comment', function (done) {
          sessionBuilderServices.update(testData.session.id, testData.session.accountId, {status: 'closed'}).then(function(closeResult) {
            models.SessionMember.find({ where: { role: 'participant' } }).then(function(member) {
              sessionServices.changeComment(member.id, "test", testData.account.id).then(function(result) {
                assert.equal(result.message, sessionServices.messages.commentChanged);
                done();
              }, function(error) {
                done(error);
              });
            });
          }, function(error) {
            done(error);
          });
        });
      });

      describe('sad path', function() {
        it('should fail because session not closed', function (done) {
          models.SessionMember.find({ where: { role: 'participant' } }).then(function(member) {
            sessionServices.changeComment(member.id, "test", testData.account.id).then(function(result) {
              done('Should not get here!');
            }, function(error) {
              assert.equal(error, sessionServices.messages.sessionNotClosed);
              done();
            });
          });
        });

        it('should fail because not found', function (done) {
          sessionServices.findSession(testData.session.id, testData.account.id).then(function(result) {
            sessionServices.changeComment(result.data.dataValues.facilitator.id + 100, "test", testData.account.id).then(function(result) {
              done('Should not get here!');
            }, function(error) {
              assert.equal(error, sessionServices.messages.sessionMemberNotFound);
              done();
            });
          });
        });
      });
    });

  });
});
