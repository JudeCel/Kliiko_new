'use strict';

var models = require('./../../models');
var Survey = models.Survey;

var surveyServices = require('./../../services/survey');
var userFixture = require('./../fixtures/user');
var assert = require('chai').assert;

describe('SERVICE - Survey', function() {
  var testUser, testAccount;

  beforeEach(function(done) {
    userFixture.createUserAndOwnerAccount().then(function(result) {
      testUser = result.user;
      testAccount = result.account;
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

  it('finds all surveys', function (done) {
    surveyServices.findAllSurveys({ accountOwnerId: testAccount.id })
    .then(function(surveys) {
        assert.deepEqual(surveys, []);
        done();
      }, function(error) {
        done(error);
      }
    );
  });
});
