'use strict';

var models = require('./../../models');
var SessionMember = models.SessionMember;

var sessionFixture = require('./../fixtures/session');
var sessionMemberServices = require('./../../services/sessionMember');

var assert = require('chai').assert;
var _ = require('lodash');

describe('SERVICE - SessionMember', function() {
  var testData = {};

  beforeEach(function(done) {
    sessionFixture.createChat().then(function(result) {
      testData.user = result.user;
      testData.account = result.account;
      testData.session = result.session;
      testData.member = result.sessionMembers[0];
      models.AccountUser.find({
        where: {
          AccountId: testData.account.id,
          UserId: testData.user.id
        }
      }).then(function(accountUser) {
        testData.accountUser = accountUser;
        done();
      });
    }, function(error) {
      done(error);
    });
  });

  afterEach(function(done) {
    models.sequelize.sync({ force: true }).then(() => {
      done();
    });
  });

  describe('#createToken', function() {
    describe('happy path', function() {
      it('should succeed on creating new token', function (done) {
        let token = testData.member.token;

        sessionMemberServices.createToken(testData.member.id).then(function(result) {
          assert.notEqual(result.token, token);
          done();
        }, function(error) {
          done(error);
        });
      });
    });

    describe('sad path', function() {
      it('should fail on finding session member', function (done) {
        let fakeId = testData.member.id + 100;

        sessionMemberServices.createToken(fakeId).then(function(result) {
          done('Should not get here!');
        }, function(error) {
          assert.equal(error, sessionMemberServices.messages.notFound + fakeId);
          done();
        });
      });
    });
  });

  describe('#removeByIds', function() {
    describe('happy path', function() {
      it('should succeed on removing session member by ids', function (done) {
        SessionMember.findAll().then(function(members) {
          assert.equal(members.length, 4);
          let ids = _.map(members, 'id');

          sessionMemberServices.removeByIds(ids, testData.session.id, testData.account.id).then(function(removed) {
            assert.equal(removed, 4);

            SessionMember.count().then(function(c) {
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
      it('should fail on removing session member by ids', function (done) {
        SessionMember.findAll().then(function(members) {
          assert.equal(members.length, 4);

          sessionMemberServices.removeByIds([], testData.session.id, testData.account.id).then(function(removed) {
            assert.equal(removed, 0);

            SessionMember.count().then(function(c) {
              assert.equal(c, 4);
              done();
            });
          }, function(error) {
            done(error);
          });
        });
      });
    });
  });

  describe('#removeByRole', function() {
    describe('happy path', function() {
      it('should succeed on removing session member by role', function (done) {
        SessionMember.count().then(function(c) {
          assert.equal(c, 4);

          sessionMemberServices.removeByRole('participant', testData.session.id, testData.account.id).then(function(removed) {
            assert.equal(removed, 2);

            SessionMember.count().then(function(c) {
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
      it('should fail on removing session member because none with that role', function (done) {
        SessionMember.count().then(function(c) {
          assert.equal(c, 4);

          sessionMemberServices.removeByRole('observer', testData.session.id, testData.account.id).then(function(removed) {
            assert.equal(removed, 1);

            SessionMember.count().then(function(c) {
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
