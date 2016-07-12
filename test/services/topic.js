"use strict";
var assert = require('chai').assert;
var models  = require('./../../models');
var Session = models.Session;
var topicService  = require('./../../services/topics');
var UserService  = require('./../../services/users');
var subscriptionFixture = require('./../fixtures/subscription');
var userFixture = require('./../fixtures/user');
let q = require('q');

describe('Topic Service', function() {
  function createSession() {
    let deferred = q.defer();

    let startTime = new Date();
    let sessionAttrs = {
      name: "cool session",
      startTime: startTime,
      endTime: startTime.setHours(startTime.getHours() + 2000),
      status_id: 1,
      colours_used: '["3","6","5"]',
      accountId: testAccount.id
    }
    Session.create(sessionAttrs).then(function(session) {
      deferred.resolve(session);
    }, function(err) {
      deferred.reject(err);
    })
    return deferred.promise;
  }

  var testUser, testAccount;

  beforeEach(function(done) {
    userFixture.createUserAndOwnerAccount().then(function(result) {
      testUser = result.user;
      testAccount = result.account;
      done();
    }).catch(function(error) {
      done(error);
    });
  });

  afterEach(function(done) {
    models.sequelize.sync({ force: true }).then(() => {
      done();
    });
  });

  it('create', function (done) {
    let attrs = {
      accountId: testAccount.id,
      name: "cool topic name"
    }

    subscriptionFixture.createSubscription(testAccount.id, testUser.id).then(function() {
      topicService.create(attrs).then(function(topic){
        assert.equal(topic.name, attrs.name)
        done();
      }, function(error) {
        done(error);
      });
    }, function(error) {
      done(error);
    });

  });

  describe("with Session", function() {
    var testSession = null;
    beforeEach(function(done) {
      createSession().then(function(session) {
        testSession = session;
        done();
      }, function(err) {
        done(err);
      })
    })

    it("joinToSession", function(done) {
      let attrs = {
        accountId: testAccount.id,
        name: "without session"
      }

      subscriptionFixture.createSubscription(testAccount.id, testUser.id).then(function() {
        topicService.create(attrs).then(function(topic){
          topicService.joinToSession([topic.id], testSession.id).then(function(result) {
            topic.getSessions().then(function(resuts) {
              assert.lengthOf(resuts, 1)
              done();
            }, function(err) {
              done(err)
            })
          }, function(err) {
            done(err)
          })
        }, function(err) {
          done(err)
        });
      }, function(error) {
        done(error);
      });
    });

    it("removeFromSession", function(done) {
      let attrs = {
        accountId: testAccount.id,
        name: "without session"
      }

      subscriptionFixture.createSubscription(testAccount.id, testUser.id).then(function() {
        topicService.create(attrs).then(function(topic){
          topicService.joinToSession([topic.id], testSession.id).then(function(_) {
            topicService.removeFromSession([testSession.id], testSession.id).then(function(result) {
              assert.equal(result, 1)
              done()
            }, function(err) {
              done(err)
            })
          }, function(err) {
            done(err)
          })
        }, function(err) {
          done(err)
        });
      }, function(error) {
        done(error);
      });
    })

    it("destroy", function(done) {
      let attrs = {
        accountId: testAccount.id,
        name: "without session"
      }

      subscriptionFixture.createSubscription(testAccount.id, testUser.id).then(function() {
        topicService.create(attrs).then(function(topic){
          topicService.joinToSession([topic.id], testSession.id).then(function(_) {
            topicService.destroy(topic.id).then(function(result) {
              done("can't get here");
            }, function(err) {
              assert.equal(err, topicService.MESSAGES.error.isRelaitedSession)
              done();
            })
          }, function(err) {
            done(err)
          })
        }, function(err) {
          done(err)
        });
      }, function(error) {
        done(error);
      });

    })
  })


  describe("destroy", function () {
    it("no relaited with session", function(done) {
      let attrs = {
        accountId: testAccount.id,
        name: "without session"
      }

      subscriptionFixture.createSubscription(testAccount.id, testUser.id).then(function() {
        topicService.create(attrs).then(function(topic){
          topicService.destroy(topic.id).then(function(result) {
            assert.equal(result, 1)
            done();
          }, function(err) {
            done(err)
          })
        }, function(err) {
          done(err)
        });
      }, function(error) {
        done(error);
      });

    })
  });
});
