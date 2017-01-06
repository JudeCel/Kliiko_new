"use strict";
var assert = require('chai').assert;
var models  = require('./../../models');
var Session = models.Session;
var topicService  = require('./../../services/topics');
var UserService  = require('./../../services/users');
var subscriptionFixture = require('./../fixtures/subscription');
var userFixture = require('./../fixtures/user');
let q = require('q');
var MessagesUtil = require('./../../util/messages');

describe.only('Topic Service', function() {
  function createSession() {
    let deferred = q.defer();

    let startTime = new Date();
    let sessionAttrs = {
      name: "cool session",
      type: 'focus',
      startTime: startTime,
      endTime: startTime.setHours(startTime.getHours() + 2000),
      status_id: 1,
      colours_used: '["3","6","5"]',
      accountId: testAccount.id,
      timeZone: 'Europe/Riga'
    }
    Session.create(sessionAttrs).then(function(session) {
      deferred.resolve(session);
    }, function(err) {
      deferred.reject(err);
    })
    return deferred.promise;
  }

  function getTopicParams() {
    return {
      accountId: testAccount.id,
      name: "cool topic name",
      boardMessage: "je"
    };
  }

  var testUser, testAccount;

  beforeEach(function(done) {
    models.sequelize.sync({ force: true }).then(() => {
      userFixture.createUserAndOwnerAccount().then(function(result) {
        testUser = result.user;
        testAccount = result.account;
        done();
      }).catch(function(error) {
        done(error);
      });
    });
  });

  it('create', function (done) {
    let attrs = getTopicParams();
    subscriptionFixture.createSubscription(testAccount.id, testUser.id).then(function() {
      topicService.create(attrs).then(function(topic){
        assert.equal(topic.name, attrs.name);
        done();
      }, function(error) {
        done(error);
      });
    }, function(error) {
      done(error);
    });
  });

  describe("update", function() {
    it('update', function (done) {
      let attrs = getTopicParams();
      subscriptionFixture.createSubscription(testAccount.id, testUser.id).then(function() {
        topicService.create(attrs).then(function(topic){
          let params = {id: topic.id, name: "update test"};
          topicService.update(params).then(function(updatedTopic){
            assert.equal(updatedTopic.name, params.name);
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

    it('update stock', function (done) {
      let attrs = getTopicParams();
      attrs.stock = true;
      subscriptionFixture.createSubscription(testAccount.id, testUser.id).then(function() {
        topicService.create(attrs, true).then(function(topic){
          let params = {id: topic.id, name: "update test"};
          topicService.update(params).then(function(updatedTopic){
            assert.notEqual(updatedTopic.id, params.id);
            assert.equal(updatedTopic.name, params.name);
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

  });

  describe("with Session", function() {
    var testSession = null;
    beforeEach(function(done) {
      createSession().then(function(session) {
        testSession = session;
        done();
      }, function(err) {
        done(err);
      });
    })

    it("joinToSession", function(done) {
      subscriptionFixture.createSubscription(testAccount.id, testUser.id).then(function() {
        topicService.create(getTopicParams()).then(function(topic) {
          topicService.joinToSession([topic.id], testSession.id).then(function(result) {
            topic.getSessions().then(function(results) {
              assert.lengthOf(results, 1);
              done();
            }, function(err) {
              done(err);
            });
          }, function(err) {
            done(err);
          });
        }, function(err) {
          done(err);
        });
      }, function(error) {
        done(error);
      });
    });

    it("joinToSession skip stock", function(done) {
      subscriptionFixture.createSubscription(testAccount.id, testUser.id).then(function() {
        let params = getTopicParams();
        params.stock = true;
        topicService.create(params, true).then(function(topic) {
          topicService.joinToSession([topic.id], testSession.id).then(function(result) {
            assert.isTrue(result.skipedStock);
            topic.getSessions().then(function(results) {
              assert.lengthOf(results, 0);
              done();
            }, function(err) {
              done(err);
            });
          }, function(err) {
            done(err);
          });
        }, function(err) {
          done(err);
        });
      }, function(error) {
        done(error);
      });
    });

    it("removeFromSession", function(done) {
      subscriptionFixture.createSubscription(testAccount.id, testUser.id).then(function() {
        topicService.create(getTopicParams()).then(function(topic){
          topicService.joinToSession([topic.id], testSession.id).then(function(_) {
            topicService.removeFromSession([topic.id], testSession.id).then(function(result) {
              assert.equal(result, 1);
              done();
            }, function(err) {
              done(err);
            });
          }, function(err) {
            done(err);
          });
        }, function(err) {
          done(err);
        });
      }, function(error) {
        done(error);
      });
    })

    it("destroy", function(done) {
      subscriptionFixture.createSubscription(testAccount.id, testUser.id).then(function() {
        topicService.create(getTopicParams()).then(function(topic){
          topicService.joinToSession([topic.id], testSession.id).then(function(_) {
            topicService.destroy(topic.id).then(function(result) {
              done("can't get here");
            }, function(err) {
              assert.equal(err, topicService.messages.error.relatedSession)
              done();
            });
          }, function(err) {
            done(err);
          });
        }, function(err) {
          done(err);
        });
      }, function(error) {
        done(error);
      });
    });
  });


  describe("destroy", function () {
    describe("happy path", function () {
      it("no relaited with session", function(done) {
        subscriptionFixture.createSubscription(testAccount.id, testUser.id).then(function() {
          topicService.create(getTopicParams()).then(function(topic){
            topicService.destroy(topic.id).then(function(result) {
              assert.equal(result, 1)
              done();
            }, function(err) {
              done(err);
            }, function(err) {
              done(err);
            });
          }, function(err) {
            done(err);
          });
        }, function(error) {
          done(error);
        });
      });
    });

    describe("sad path", function () {
      it("default", function(done) {
        subscriptionFixture.createSubscription(testAccount.id, testUser.id).then(function() {
          let params = getTopicParams();
          params.default = true;
          topicService.create(params).then(function(topic){
            topicService.destroy(topic.id).then(function(result) {
              done("Should not get here");
            }, function(err) {
              assert.equal(err, MessagesUtil.topics.error.default);
              done();
            }, function(err) {
              done(err);
            });
          }, function(err) {
            done(err);
          });
        }, function(error) {
          done(error);
        });
      });

      it("stock", function(done) {
        subscriptionFixture.createSubscription(testAccount.id, testUser.id).then(function() {
          let params = getTopicParams();
          params.stock = true;
          topicService.create(params, true).then(function(topic){
            topicService.destroy(topic.id).then(function(result) {
              done("Should not get here");
            }, function(err) {
              assert.equal(err, MessagesUtil.topics.error.stock);
              done();
            }, function(err) {
              done(err);
            });
          }, function(err) {
            done(err);
          });
        }, function(error) {
          done(error);
        });
      });

    });
  });
});
