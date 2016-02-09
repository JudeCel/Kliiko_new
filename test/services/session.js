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
    return testData.account.id;
  };

  describe('#findSession', function() {
    describe('happy path', function() {
      it('should succeed on finding session', function (done) {
        sessionServices.findSession(testData.session.id, testData.account.id, 'facilitator').then(function(result) {
          assert.equal(result.data.accountId, testData.account.id);
          done();
        }, function(error) {
          done(error);
        });
      });
    });

    describe('sad path', function() {
      it('should fail on finding session', function (done) {
        sessionServices.findSession(testData.session.id + 100, testData.account.id, 'facilitator').then(function(result) {
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
        sessionServices.findAllSessions(testData.user.id, testData.account.id).then(function(result) {
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
});
