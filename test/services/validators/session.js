'use strict';

var models = require('./../../../models');
var sessionValidator = require('./../../../services/validators/session');
var sessionFixture = require('./../../fixtures/session');

var assert = require('chai').assert;

describe('SERVICE - VALIDATORS - Session', function() {
  var testData, sessionMember;

  beforeEach(function(done) {
    sessionFixture.createChat().then(function(result) {
      testData = result;
      done();
    }, function(error) {
      done(error);
    });
  });

  afterEach(function(done) {
    models.sequelize.sync({ force: true }).then(function() {
      done();
    });
  });

  function provider(params) {
    return {
      request: function(callback) {
        callback(null, { subscription: { current_term_end: params.end || new Date() } });
      }
    }
  }

  function sessionMemberData(params) {
    let today = new Date();
    let tomorrow = new Date(today).setMonth(today.getMonth() + 1);

    return {
      role: params.memberRole,
      Session: {
        dataValues: {},
        id: testData.session.id,
        active: params.active,
        startTime: (params.startTime || today),
        endTime: (params.endTime || tomorrow),
        SessionTopics: params.topics || [],
        Account: {
          Subscription: {
            subscriptionId: testData.subscription.subscriptionId
          }
        }
      },
      AccountUser: {
        id: testData.accountUser.id,
        role: params.userRole
      },
    }
  }

  describe('#validate', function() {
    describe('account user', function() {
      describe('accountManager & observer/facilitator', function() {
        beforeEach(function(done) {
          sessionMember = sessionMemberData({
            memberRole: 'observer',
            userRole: 'accountManager',
            active: false,
            topics: ['topic']
          });

          done();
        });

        describe('happy path', function() {
          it('topics', function(done) {
            sessionValidator.validate(sessionMember, provider).then(function() {
              done();
            }, function(error) {
              done(error);
            });
          });
        });

        describe('sad path', function() {
          it('topics', function(done) {
            sessionMember.Session.SessionTopics = [];

            sessionValidator.validate(sessionMember, provider).then(function() {
              done('Should not get here!');
            }, function(error) {
              assert.equal(error, sessionValidator.messages.topics);
              done();
            });
          });
        });
      });

      describe('accountManager & participant', function() {
        beforeEach(function(done) {
          sessionMember = sessionMemberData({
            memberRole: 'participant',
            userRole: 'accountManager',
            active: true,
            topics: ['topic']
          });

          done();
        });

        describe('happy path', function() {
          it('topics & dates & state', function(done) {
            sessionValidator.validate(sessionMember, provider).then(function() {
              done();
            }, function(error) {
              done(error);
            });
          });
        });

        describe('sad path', function() {
          it('topics', function(done) {
            sessionMember.Session.SessionTopics = [];

            sessionValidator.validate(sessionMember, provider).then(function() {
              done('Should not get here!');
            }, function(error) {
              assert.equal(error, sessionValidator.messages.topics);
              done();
            });
          });

          it('state', function(done) {
            sessionMember.Session.active = false;

            sessionValidator.validate(sessionMember, provider).then(function() {
              done('Should not get here!');
            }, function(error) {
              assert.equal(error, sessionValidator.messages.closed);
              done();
            });
          });

          it('dates', function(done) {
            let date = new Date();
            date.setMonth(date.getMonth() - 2);
            sessionMember.Session.endTime = date;

            sessionValidator.validate(sessionMember, provider).then(function() {
              done('Should not get here!');
            }, function(error) {
              assert.equal(error, sessionValidator.messages.errors.Expired);
              done();
            });
          });
        });
      });
    });

    describe('session member', function() {
      describe('facilitator', function() {
        beforeEach(function(done) {
          sessionMember = sessionMemberData({
            memberRole: 'facilitator',
            userRole: 'facilitator',
            active: false,
            topics: ['topic']
          });

          done();
        });

        describe('happy path', function() {
          it('topics', function(done) {
            sessionValidator.validate(sessionMember, provider).then(function() {
              done();
            }, function(error) {
              done(error);
            });
          });
        });

        describe('sad path', function() {
          it('topics', function(done) {
            sessionMember.Session.SessionTopics = [];

            sessionValidator.validate(sessionMember, provider).then(function() {
              done('Should not get here!');
            }, function(error) {
              assert.equal(error, sessionValidator.messages.topics);
              done();
            });
          });
        });
      });

      describe('participant/observer', function() {
        beforeEach(function(done) {
          sessionMember = sessionMemberData({
            memberRole: 'observer',
            userRole: 'facilitator',
            active: true,
            topics: ['topic']
          });

          done();
        });

        describe('happy path', function() {
          it('topics & dates & state', function(done) {
            sessionValidator.validate(sessionMember, provider).then(function() {
              done();
            }, function(error) {
              done(error);
            });
          });
        });

        describe('sad path', function() {
          it('topics', function(done) {
            sessionMember.Session.SessionTopics = [];

            sessionValidator.validate(sessionMember, provider).then(function() {
              done('Should not get here!');
            }, function(error) {
              assert.equal(error, sessionValidator.messages.topics);
              done();
            });
          });

          it('state', function(done) {
            sessionMember.Session.active = false;

            sessionValidator.validate(sessionMember, provider).then(function() {
              done('Should not get here!');
            }, function(error) {
              assert.equal(error, sessionValidator.messages.closed);
              done();
            });
          });

          it('dates', function(done) {
            let date = new Date();
            date.setMonth(date.getMonth() - 2);
            sessionMember.Session.endTime = date;

            sessionValidator.validate(sessionMember, provider).then(function() {
              done('Should not get here!');
            }, function(error) {
              assert.equal(error, sessionValidator.messages.errors.Expired);
              done();
            });
          });
        });
      });
    });
  });

  describe('#validateState', function() {
    describe('happy path', function() {
      it('should succeed because session is active', function(done) {
        sessionValidator.validateState(testData.session, function(result) {
          assert.isNull(result);
          done();
        });
      });
    });

    describe('sad path', function() {
      it('should fail because session is not active', function(done) {
        testData.session.active = false;
        sessionValidator.validateState(testData.session, function(result) {
          assert.equal(result, sessionValidator.messages.closed);
          done();
        });
      });
    });
  });

  describe('#validateTopics', function() {
    describe('happy path', function() {
      it('should succeed because session has topics', function(done) {
        testData.session.SessionTopics = ['topic1', 'topic2'];
        sessionValidator.validateTopics(testData.session, function(result) {
          assert.isNull(result);
          done();
        });
      });
    });

    describe('sad path', function() {
      it('should fail because session has no topics', function(done) {
        sessionValidator.validateTopics(testData.session, function(result) {
          assert.equal(result, sessionValidator.messages.topics);
          done();
        });
      });
    });
  });

  describe('#validateDates', function() {
    beforeEach(function(done) {
      models.Subscription.find({ where: { accountId: testData.account.id } }).then(function(subscription) {
        testData.session.Account = testData.account;
        testData.session.Account.Subscription = subscription;
        done();
      }, function(error) {
        done(error);
      });
    });

    describe('happy path', function() {
      it('should succeed because session has valid dates', function(done) {
        testData.session.startTime.setMonth(testData.session.startTime.getMonth() - 3);

        sessionValidator.validateDates(testData.session, provider, function(result) {
          assert.isNull(result);
          done();
        });
      });
    });

    describe('sad path', function() {
      it('should fail because session has not started', function(done) {
        sessionValidator.validateDates(testData.session, provider, function(result) {
          assert.equal(result, sessionValidator.messages.errors.Pending);
          done();
        });
      });

      it('should fail because session has ended', function(done) {
        testData.session.startTime = new Date();
        testData.session.endTime = new Date();
        testData.session.startTime.setMonth(testData.session.startTime.getMonth() - 3);
        testData.session.endTime.setMonth(testData.session.endTime.getMonth() - 2);

        sessionValidator.validateDates(testData.session, provider, function(result) {
          assert.equal(result, sessionValidator.messages.errors.Expired);
          done();
        });
      });
    });
  });
});
