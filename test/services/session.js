'use strict';

var models = require('./../../models');
var Session = models.Session;

var sessionServices = require('./../../services/session');
var sessionFixture = require('./../fixtures/session');
var subscriptionFixture = require('./../fixtures/subscription');

var assert = require('chai').assert;

describe('SERVICE - Session #canChangeAnonymous', function() {
  it('when session closed', function (done) {
    let tmpSession = {status: 'closed'}
    let result = sessionServices.canChangeAnonymous(tmpSession)
    try {
      assert.equal(result, false);
      done()
    } catch (e) {
      done(e)
    }
  });

  it('when session expired', function (done) {
    let startTime = new Date();
    let endTime = startTime.setHours(startTime.getHours() - 2000)

    let tmpSession = {endTime: endTime}
    let result = sessionServices.canChangeAnonymous(tmpSession)
    try {
      assert.equal(result, false);
      done()
    } catch (e) {
      done(e)
    }
  });

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

  it('when session is valid', function (done) {
    let startTime = new Date();
    let endTime = startTime.setHours(startTime.getHours() + 2000)

    let tmpSession = {anonymous: false, status: 'open', endTime: endTime}
    let result = sessionServices.canChangeAnonymous(tmpSession)
    try {
      assert.equal(result, true);
      done()
    } catch (e) {
      done(e)
    }
  });
})

describe('SERVICE - Session', function() {
  var testData = {};

  beforeEach(function(done) {
    models.sequelize.sync({ force: true }).then(() => {
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

  function provider(params) {
    return {
      request: function(callback) {
        callback(null, { subscription: {} });
      }
    }
  }

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
        sessionServices.findSession(testData.session.id, testData.account.id, provider).then(function(result) {
          assert.equal(result.data.accountId, testData.account.id);
          done();
        }, function(error) {
          done(error);
        });
      });
    });

    describe('sad path', function() {
      it('should fail on finding session', function (done) {
        sessionServices.findSession(testData.session.id + 100, testData.account.id, provider).then(function(result) {
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
        sessionServices.findAllSessions(testData.user.id, accountParams(), provider).then(function(result) {
          assert.equal(result.data[0].accountId, testData.account.id);
          done();
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

          sessionServices.removeSession(testData.session.id, testData.account.id, provider).then(function(result) {
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
    });

    describe('sad path', function() {
      it('should fail because not found', function (done) {
        sessionServices.removeSession(testData.session.id + 100, testData.account.id, provider).then(function(result) {
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

            sessionServices.copySession(testData.session.id, testData.account.id, provider).then(function(result) {
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
          sessionServices.copySession(testData.session.id + 100, testData.account.id, provider).then(function(result) {
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
        models.SessionMember.find({ where: { role: 'facilitator' } }).then(function(member) {
          let params = { id: member.id, rating: 4 };

          models.SessionMember.find({
            where: {
              role: 'participant'
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
          })

        })
      });
    });

    describe('sad path', function() {
      it('should fail because not found', function (done) {
        sessionServices.findSession(testData.session.id, testData.account.id, provider).then(function(result) {
          let params = { id: result.data.dataValues.facilitator.id + 100, rating: 4 };

          sessionServices.updateSessionMemberRating(params, testData.user.id, testData.account.id).then(function(result) {
            done('Should not get here!');
          }, function(error) {
            assert.equal(error, sessionServices.messages.sessionMemberNotFound);
            done();
          });
        });
      });

      it('should fail because cannot rate self', function (done) {
        models.Subscription.find({ include: [{ model: models.Account, include: [{ model: models.AccountUser, include: [models.SessionMember] }] }] }).then(function(subscription) {
          let accountId = subscription.Account.AccountUsers[0].AccountId;
          let userId = subscription.Account.AccountUsers[0].UserId;

          sessionServices.findSession(testData.session.id, accountId, provider).then(function(result) {
            let params = { id: subscription.Account.AccountUsers[0].SessionMembers[0].id, rating: 4 };

            sessionServices.updateSessionMemberRating(params, userId, accountId).then(function(result) {
              done('Should not get here!');
            }, function(error) {
              assert.equal(error, sessionServices.messages.cantRateSelf);
              done();
            });
          });
        });
      });
    });
  });
});
