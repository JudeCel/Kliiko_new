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
var testDatabase = require("../database");
var sessionBuilderSnapshotValidation = require('./../../services/sessionBuilderSnapshotValidation');

describe('Topic Service', function() {
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
    testDatabase.prepareDatabaseForTests().then(() => {
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
          let params = {id: topic.id, name: "update test", accountId: testAccount.id};
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

  describe("#getAll", function() {
    beforeEach(function(done) {
      let attrs = getTopicParams();
      subscriptionFixture.createSubscription(testAccount.id, testUser.id).then(function() {
        topicService.create(attrs, true).then(function(topic){
          attrs.inviteAgain = true;
          attrs.name = "It's A Wrap";
          topicService.create(attrs, true).then(function(topic){
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
    })

    it("with InviteAgain", function(done) {
      topicService.getAll(testAccount.id, null).then(function(topics) {
        assert.equal(topics.topics.length, 3);
        done();
      }, function(error) {
        done(error);
      });
    });

    it("without InviteAgain", function(done) {
      topicService.getAll(testAccount.id, "focus").then(function(topics) {
        assert.equal(topics.topics.length, 2);
        done();
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

    it("should update both session and resources topics when changing default topic", function(done) {
      subscriptionFixture.createSubscription(testAccount.id, testUser.id).then(function() {
        let defaultTopicParams = getTopicParams();
        defaultTopicParams.default = true;
        topicService.create(defaultTopicParams).then(function(topic) {
          topicService.joinToSession([topic.id], testSession.id).then(function(result) {

            defaultTopicParams.boardMessage = "Resources Topic Test";
            defaultTopicParams.sign = "Resources Topic Test";
            defaultTopicParams.id = topic.id;

            topicService.updateDefaultTopic(defaultTopicParams, true).then(function(updatedTopic) {
              models.SessionTopics.findAll({where: {topicId: defaultTopicParams.id}}).then((sessionTopics) => {
                assert.equal(updatedTopic.boardMessage, defaultTopicParams.boardMessage);
                assert.equal(updatedTopic.sign, defaultTopicParams.sign);
                assert.lengthOf(sessionTopics, 1);
                assert.equal(sessionTopics[0].boardMessage, updatedTopic.boardMessage);
                assert.equal(sessionTopics[0].sign, updatedTopic.sign);
                assert.equal(sessionTopics[0].name, updatedTopic.name);
                assert.equal(sessionTopics[0].topicId, updatedTopic.id);

                done();
              }, (error) => {
                done(error);
              });
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

    it("should update both session and resources topics when changing session default topic", function(done) {
      subscriptionFixture.createSubscription(testAccount.id, testUser.id).then(function() {
        let defaultTopicParams = getTopicParams();
        defaultTopicParams.default = true;
        topicService.create(defaultTopicParams).then(function(topic) {
          topicService.joinToSession([topic.id], testSession.id).then(function(result) {

          defaultTopicParams.boardMessage = "Session Topic Test";
          defaultTopicParams.sign = "Session  Topic Test";
          defaultTopicParams.topicId = topic.id;
          defaultTopicParams.isCurrentSessionTopic = true;
          defaultTopicParams.snapshot = { 
            [topic.id] : sessionBuilderSnapshotValidation.getTopicSnapshot(result.sessionTopics)
          };
          defaultTopicParams.sessionId = testSession.id;
          defaultTopicParams.id = result.sessionTopics[0].id;
            
          topicService.updateDefaultTopic(defaultTopicParams, true).then(function(updatedTopic) {
            
            models.SessionTopics.findAll({where: {topicId: defaultTopicParams.topicId}}).then((sessionTopics) => {
              assert.lengthOf(sessionTopics, 1);
              assert.equal(sessionTopics[0].boardMessage, defaultTopicParams.boardMessage);
              assert.equal(sessionTopics[0].sign, defaultTopicParams.sign);
              assert.equal(sessionTopics[0].topicId, defaultTopicParams.topicId);
              assert.equal(sessionTopics[0].sessionId, defaultTopicParams.sessionId);
              models.Topic.find({where: {id: defaultTopicParams.topicId}}).then((defaultTopic) => {
                assert.isObject(defaultTopic);
                assert.equal(defaultTopicParams.boardMessage, defaultTopic.boardMessage);
                assert.equal(defaultTopicParams.sign, defaultTopic.sign);
                done();
              }, (error) => {
                done(error)
              })
            }, (error) => {
              done(error);
            });
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
