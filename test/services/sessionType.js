'use strict';

let Bluebird = require('bluebird');
let sessionTypeService = require('../../services/sessionType');
let models = require("../../models");
let testDatabase = require("../database");
let sessionTypesConstants = require('../../util/sessionTypesConstants');

var assert = require('chai').assert;

describe('SERVICE - SessionType', function() {
  beforeEach(function(done) {
    testDatabase.prepareDatabaseForTests().then(() => {
      done();
    });
  }, function(error) {
    done(error);
  });

  describe('#updateSessionTypes', function() {
    it('should update session types or create if not exists', function (done) {
      removeSessionType('forum').then(function() {
        sessionTypeService.updateSessionTypes().then(function() {
          var types = Object.keys(sessionTypesConstants);
          Bluebird.each(types, (type) => {
            return checkSessionType(type);
          }).then(function() {
            done();
          }, function(error) {
            done(error);
          });
        },function(error) {
          done(error);
        });
      },function(error) {
        done(error);
      });
    });

    function checkSessionType(type) {
      return new Bluebird((resolve, reject) => {
        models.SessionType.find({ where: { name: type } }).then(function(sessionType) {
          try {
            assert.deepEqual(sessionType.properties, sessionTypesConstants[type]);
            resolve();
          } catch (e) {
            reject(e);
          }
        }, function(error) {
          reject(error);
        });
      });
    }

    function removeSessionType(type) {
      return new Bluebird((resolve, reject) => {
        models.SessionType.destroy({where: { name: type } }).then(function() {
          resolve();
        },function(error) {
          reject(error);
        });
      });
    }
  });

});
