'use strict';

var assert = require('chai').assert;
var _ = require('lodash');

var sessionMemberMiddleware = require('./../../middleware/sessionMember');
var sessionFixture = require('./../fixtures/session');
var models = require('./../../models');

describe('MIDDLEWARE - Session Member', function() {
  let req, res;

  function setVariables(userId, sessionId, accountId) {
    req = {
      user: { id: userId },
      params: { id: sessionId }
    }
    res = {
      locals: { currentDomain: { id: accountId } }
    }
  }

  beforeEach(function(done) {
    sessionFixture.createChat().then(function(result) {
      _.map(result.sessionMembers, function(member) {
        if(member.role == 'facilitator') {
          models.AccountUser.find({ where: { id: member.accountUserId } }).then(function(accountUser) {
            setVariables(accountUser.UserId, result.session.id, accountUser.AccountId);
            done();
          });
        }
      });
    }, function(error) {
      done(error);
    });
  });

  afterEach(function(done) {
    models.sequelize.sync({ force: true }).then(function() {
      done();
    });
  });

  describe('happy path ', function() {
    it('call next Callback when has access', function(done)  {
      let result = sessionMemberMiddleware.hasAccess(['facilitator']);
      result(req, res, done);
    });
  });

  describe('sad path ', function() {
    function setFailVariables(done) {
      res.status = function() {
        return {
          send: function(result) {
            assert.equal(result, sessionMemberMiddleware.accessDeniedMessage);
            done();
          }
        }
      }
    };

    function shouldNotGetHere(done) {
      return function() {
        done('Should not get here!');
      }
    };

    it('should fail because no currentDomain account id', function(done)  {
      delete res.locals.currentDomain.id;
      setFailVariables(done);
      sessionMemberMiddleware.hasAccess(['facilitator'])(req, res, shouldNotGetHere(done));
    });

    it('should fail because no user id', function(done)  {
      delete req.user.id;
      setFailVariables(done);
      sessionMemberMiddleware.hasAccess(['facilitator'])(req, res, shouldNotGetHere(done));
    });

    it('should fail because no session id', function(done)  {
      delete req.params.id;
      setFailVariables(done);
      sessionMemberMiddleware.hasAccess(['facilitator'])(req, res, shouldNotGetHere(done));
    });

    it('should fail because dont have the role', function(done)  {
      setFailVariables(done);
      sessionMemberMiddleware.hasAccess(['observer'])(req, res, shouldNotGetHere(done));
    });
  });
});
