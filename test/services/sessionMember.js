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

  describe('#bulkCreate', function() {
    function sessionMemberParams() {
      return {
        role: 'participant',
        accountUserId: testData.accountUser.id,
        username: 'Kuul user',
        sessionId: testData.session.id
      };
    };

    function multipleMembers(count) {
      let array = new Array(count);
      array.fill(sessionMemberParams());
      return array;
    };

    describe('happy path', function() {
      beforeEach(function(done) {
        SessionMember.destroy({ where: { sessionId: testData.session.id } }).then(function() {
          done();
        });
      });

      it('should succeed on creating session member', function (done) {
        sessionMemberServices.bulkCreate(multipleMembers(1), testData.session.id).then(function(result) {
          assert.equal(result.length, 1);

          SessionMember.count().then(function(c) {
            assert.equal(c, 1);
            done();
          });
        }, function(error) {
          done(error);
        });
      });

      it('should succeed on creating multiple session members', function (done) {
        sessionMemberServices.bulkCreate(multipleMembers(3), testData.session.id).then(function(result) {
          assert.equal(result.length, 3);

          SessionMember.count().then(function(c) {
            assert.equal(c, 3);
            done();
          });
        }, function(error) {
          done(error);
        });
      });
    });

    describe('sad path', function() {
      it('should fail on creating because wrong params', function (done) {
        let params = multipleMembers(1);
        delete params[0].username;

        sessionMemberServices.bulkCreate(params, testData.session.id).then(function(result) {
          done('Should not get here!');
        }, function(error) {
          assert.deepEqual(error, { username: "Username can't be empty" });
          done();
        });
      });

      it('should fail on finding created because wrong session id', function (done) {
        let params = multipleMembers(1);
        let fakeId = testData.session.id + 100;

        sessionMemberServices.bulkCreate(params, fakeId).then(function(result) {
          done('Should not get here!');
        }, function(error) {
          assert.equal(error, 'Wrong Session id provided: ' + fakeId);
          done();
        });
      });
    });
  });

  describe('#removeByIds', function() {
    describe('happy path', function() {
      it('should succeed on removing session member by ids', function (done) {
        SessionMember.findAll().then(function(members) {
          assert.equal(members.length, 2);
          let ids = _.map(members, 'id');

          sessionMemberServices.removeByIds(ids, testData.session.id, testData.account.id).then(function(removed) {
            assert.equal(removed, 2);

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
          assert.equal(members.length, 2);

          sessionMemberServices.removeByIds([], testData.session.id, testData.account.id).then(function(removed) {
            assert.equal(removed, 0);

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
  });

  describe('#removeByRole', function() {
    describe('happy path', function() {
      it('should succeed on removing session member by role', function (done) {
        SessionMember.count().then(function(c) {
          assert.equal(c, 2);

          sessionMemberServices.removeByRole('participant', testData.session.id, testData.account.id).then(function(removed) {
            assert.equal(removed, 1);

            SessionMember.count().then(function(c) {
              assert.equal(c, 1);
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
          assert.equal(c, 2);

          sessionMemberServices.removeByRole('observer', testData.session.id, testData.account.id).then(function(removed) {
            assert.equal(removed, 0);

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
  });
});
