'use strict';

var assert = require('chai').assert;

var sessionMemberMiddleware = require('./../../middleware/sessionMember');
var sessionFixture = require('./../fixtures/session');
var models  = require('./../../models');

describe('MIDDLEWARE - Session Member', function() {
  let req, res;

  function setVariables(user, session, account) {
    req = {
      user: { id: user.id },
      params: { id: session.id }
    }
    res = {
      locals: { currentDomain: { id: account.id } }
    }
  }

  beforeEach(function(done) {
    sessionFixture.createChat().then(function(result) {
      setVariables(result.user, result.session, result.account);
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
      sessionMemberMiddleware.hasAccess(['participant'])(req, res, shouldNotGetHere(done));
    });
  });
});
