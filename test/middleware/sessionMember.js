'use strict';

var assert = require('chai').assert;
var _ = require('lodash');

var sessionMemberMiddleware = require('./../../middleware/sessionMember');
var sessionFixture = require('./../fixtures/session');
var models = require('./../../models');
var testDatabase = require("../database");

describe('MIDDLEWARE - Session Member', function() {
  let req, res;

  function setVariables(userId, sessionId, accountUser) {
    req = {
      user: { id: userId },
      params: { id: sessionId },
      currentResources: {
        account: { id: accountUser.AccountId }, 
        accountUser: {id: accountUser.id, role: accountUser.role},
        user: {id: accountUser.UserId}
      }
    }
    res = {
      locals: {}
    }
  }

  describe('happy path ', function() {
    beforeEach(function(done) {
      testDatabase.prepareDatabaseForTests().then(function() {
        sessionFixture.createChat().then(function(result) {
          _.map(result.sessionMembers, function(member) {
            if(member.role == 'facilitator') {
              models.AccountUser.find({ where: { id: member.accountUserId } }).then(function(accountUser) {
                setVariables(accountUser.UserId, result.session.id, accountUser);
                done();
              });
            }
          });
        }, function(error) {
          done(error);
        });
      });
    });

    it('call next Callback when has access', function(done)  {
      let result = sessionMemberMiddleware.hasAccess(['facilitator']);
      result(req, res, done);
    });
  });

  describe('sad path ', function() {
    function setFailVariables(done) {
      res.status = () => {
        return {
          send: function(result) {
            try {
              assert.equal(result, sessionMemberMiddleware.accessDeniedMessage);
              done();
            } catch (e) {
              done(e);
            }

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
      delete req.currentResources.account.id;
      setFailVariables(done);
      sessionMemberMiddleware.hasAccess(['facilitator'])(req, res, shouldNotGetHere(done));
    });

    it('should fail because no user id', function(done)  {
      delete req.currentResources.user.id;
      setFailVariables(done);
      sessionMemberMiddleware.hasAccess(['facilitator'])(req, res, shouldNotGetHere(done));
    });

    it('should fail because dont have the role', function(done)  {
      setFailVariables(done);
      sessionMemberMiddleware.hasAccess(['observer'])(req, res, shouldNotGetHere(done));
    });
  });
});
