'use strict';

var models = require('./../../models');
var Session = models.Session;

var sessionServices = require('./../../services/session');
var sessionFixture = require('./../fixtures/session');

var assert = require('chai').assert;

describe('SERVICE - Session', function() {
  var testData = {};

  beforeEach(function(done) {
    sessionFixture.createChat().then(function(result) {
      testData.user = result.user;
      testData.account = result.account;
      testData.session = result.session;
      testData.preference = result.preference;
      done();
    }, function(error) {
      done(error);
    });
  });

  afterEach(function(done) {
    models.sequelize.sync({ force: true }).then(() => {
      done();
    });
  });

  function accountParams() {
    return { id: testData.account.id, roles: ['accountManager'] };
  };

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
        sessionServices.findAllSessions(testData.user.id, accountParams()).then(function(result) {
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
      });
    });

    describe('sad path', function() {
      it('should fail because not found', function (done) {
        sessionServices.copySession(testData.session.id + 100, testData.account.id).then(function(result) {
          done('Should not get here!');
        }, function(error) {
          assert.equal(error, sessionServices.messages.notFound);
          done();
        });
      });
    });
  });

  describe('#updateSessionMemberRating', function() {
    describe('happy path', function() {
      it('should succeed on updating rating', function (done) {
        models.SessionMember.find({ where: { role: 'facilitator' } }).then(function(member) {
          let params = { id: member.id, rating: 4 };

          sessionServices.updateSessionMemberRating(params, testData.user.id, testData.account.id).then(function(result) {
            assert.equal(result.data.rating, 4);
            assert.equal(result.message, sessionServices.messages.rated);
            done();
          }, function(error) {
            done(error);
          });
        })
      });
    });

    describe('sad path', function() {
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

      it('should fail because cannot rate self', function (done) {
        sessionServices.findSession(testData.session.id, testData.account.id).then(function(result) {
          let params = { id: result.data.SessionMembers[0].id, rating: 4 };

          sessionServices.updateSessionMemberRating(params, testData.user.id, testData.account.id).then(function(result) {
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
