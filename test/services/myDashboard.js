'use strict';

var models = require('./../../models');
var userFixture = require('./../fixtures/user');
var fillDashboardFixture = require('./../fixtures/fillDashboard');
var myDashboardServices = require('./../../services/myDashboard');
var assert = require('chai').assert;
var testDatabase = require("../database");

describe('SERVICE - MyDashboard', function() {
  var testData;
  function provider() {
    return {
      request: function(callback) {
        callback(null, {});
      }
    }
  }

  describe('#getAllData', function() {
    beforeEach(function(done) {
      testDatabase.prepareDatabaseForTests().then(function() {
        userFixture.createUserAndOwnerAccount().then(function(result) {
          testData = result;
          done();
        }, function(error) {
          done(error);
        });
      }, function(error) {
        done(error);
      });
    });

    describe('happy path', function() {
      it('should succeed on finding one of each role', function(done) {
        fillDashboardFixture.fill(testData.user, ['observer', 'facilitator', 'participant']).then(function() {
          myDashboardServices.getAllData(testData.user.id, 'http', provider).then(function(result) {
            try {
              assert.equal(result.accountManager.data.length, 1);
              assert.equal(result.observer.data.length, 1);
              assert.equal(result.facilitator.data.length, 1);
              assert.equal(result.participant.data.length, 1);
              done();
            } catch (e) {
              done(e)
            }
          }, function(error) {
            done(error);
          });
        }, function(error) {
          done(error);
        });
      });

      it('should succeed on finding one of each except facilitator and participant', function(done) {
        fillDashboardFixture.fill(testData.user, ['observer']).then(function() {
          myDashboardServices.getAllData(testData.user.id, 'http', provider).then(function(result) {
            try {
              assert.equal(result.accountManager.data.length, 1);
              assert.equal(result.observer.data.length, 1);
              assert.equal(result.facilitator, undefined);
              assert.equal(result.participant, undefined);
              done();
            } catch (e) {
              done(e);
            } 
          }, function(error) {
            done(error);
          });
        }, function(error) {
          done(error);
        });
      });
    });
  });
});
