"use strict";
var assert = require('chai').assert;
var models  = require('./../../models');
var Session = models.Session;
var topicService  = require('./../../services/topics');
var UserService  = require('./../../services/users');
let q = require('q');

describe('Topic Service', function() {
  function createSession() {
    let deferred = q.defer();

    let startTime = new Date();
    let sessionAttrs = {
      name: "cool session",
      start_time: startTime,
      end_time: startTime.setHours(startTime.getHours() + 2000),
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

  var testUser = null;
  var testAccount = null;

  beforeEach(function(done) {
    var userAttrs = {
      accountName: "Lauris",
      firstName: "Lauris",
      lastName: "Blīgzna",
      password: "multipassword",
      email: "bligzna.lauris@gmail.com",
      gender: "male"
    }
    models.sequelize.sync({ force: true }).then(() => {
      UserService.create(userAttrs, function(errors, user) {
        testUser = user;
        user.getOwnerAccount().then(function(results) {
          testAccount = results[0];
          done();
        })
      });
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

    topicService.create(attrs).then(function(topic){
      assert.equal(topic.name, attrs.name)
      done();
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

    it("joninSession", function(done) {
      let attrs = {
        accountId: testAccount.id,
        name: "without session"
      }

      topicService.create(attrs).then(function(topic){
        topicService.joninSession([topic.id], testSession.id).then(function(result) {
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
    })

    it("removSession", function(done) {
      let attrs = {
        accountId: testAccount.id,
        name: "without session"
      }

      topicService.create(attrs).then(function(topic){
        topicService.joninSession([topic.id], testSession.id).then(function(_) {
          topicService.removeSession([testSession.id], testSession.id).then(function(result) {
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
    })

    it("destroy", function(done) {
      let attrs = {
        accountId: testAccount.id,
        name: "without session"
      }

      topicService.create(attrs).then(function(topic){
        topicService.joninSession([topic.id], testSession.id).then(function(_) {
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
    })
  })


  describe("destroy", function () {
    it("no relaited with session", function(done) {
      let attrs = {
        accountId: testAccount.id,
        name: "without session"
      }
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
    })
  });
});
