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

  function surveyParams() {
    return {
      name: 'Survey name',
      accountId: testAccount.id,
      SurveyQuestions: [
        surveyQuestionParams(0),
        surveyQuestionParams(1)
      ]
    };
  }

  function surveyQuestionParams(random) {
    return {
      order: random,
      name: 'Some default name ' + random,
      question: 'What a default question ' + random,
      answers: JSON.stringify({
        0: '0 answer ' + random,
        1: '1 answer ' + random,
        2: '2 answer ' + random,
        3: '3 answer ' + random
      })
    };
  }

  describe('#createSurveyWithQuestions', function() {
    describe('happy path', function() {
      it('should succeed on creating survey with questions', function (done) {
        let params = surveyParams();

        surveyServices.createSurveyWithQuestions(params).then(function(survey) {
          assert.equal(survey.accountId, testAccount.id);
          assert.equal(survey.SurveyQuestions[0].name, params.SurveyQuestions[0].name);
          assert.equal(survey.SurveyQuestions[0].question, params.SurveyQuestions[0].question);
          assert.equal(survey.SurveyQuestions[0].answers, params.SurveyQuestions[0].answers);
          assert.equal(survey.SurveyQuestions[1].name, params.SurveyQuestions[1].name);
          assert.equal(survey.SurveyQuestions[1].question, params.SurveyQuestions[1].question);
          assert.equal(survey.SurveyQuestions[1].answers, params.SurveyQuestions[1].answers);
          done();
        }, function(error) {
          done(error);
        });
      });
    });

    describe('sad path', function() {
      it('should fail without params', function (done) {
        surveyServices.createSurveyWithQuestions({}).then(function(survey) {
          done('Should not get here!');
        }, function(error) {
          assert.deepEqual(error, { accountId: 'Account Id: cannot be null', name: 'Name: cannot be null' });
          done();
        });
      });

      it('should fail on creating questions with wrong params', function (done) {
        let params = surveyParams();
        params.SurveyQuestions[0].name = '';

        surveyServices.createSurveyWithQuestions(params).then(function(survey) {
          done('Should not get here!');
        }, function(error) {
          assert.deepEqual(error, { name: "Name:can't be empty" });

          Survey.count().then(function(c) {
            assert.equal(c, 0);
            done();
          })
        });
      });
    });
  });

  describe('#findSurvey', function() {
    describe('happy path', function() {
      it('should succeed on finding survey', function (done) {
        let params = surveyParams();

        surveyServices.createSurveyWithQuestions(params).then(function(survey) {
          surveyServices.findSurvey(survey.id).then(function(result) {
            assert.equal(result.id, survey.id);
            done();
          }, function(error) {
            done(error);
          });
        });
      });
    });

    describe('sad path', function() {
      it('should fail on finding survey', function (done) {
        let params = surveyParams();

        surveyServices.createSurveyWithQuestions(params).then(function(survey) {
          surveyServices.findSurvey(survey.id + 1).then(function(result) {
            done('Should not get here!');
          }, function(error) {
            assert.equal(error, 'Survey not found');
            done();
          });
        });
      });
    });
  });

  describe('#findAllSurveys', function() {
    it('should succeed on 0 surveys', function (done) {
      surveyServices.findAllSurveys({ accountOwnerId: testAccount.id }).then(function(surveys) {
        assert.deepEqual(surveys, []);
        done();
      }, function(error) {
        done(error);
      });
    });

    it('should succeed on finding all surveys', function (done) {
      let params = surveyParams();

      surveyServices.createSurveyWithQuestions(params).then(function(survey) {
        surveyServices.findAllSurveys({ accountOwnerId: testAccount.id }).then(function(surveys) {
          assert.equal(surveys[0].id, survey.id);
          done();
        }, function(error) {
          done(error);
        });
      });
    });
  });

  describe('#updateSurvey', function() {
    describe('happy path', function() {
      it('should update survey', function (done) {
        let params = surveyParams();

        surveyServices.createSurveyWithQuestions(params).then(function(survey) {
          assert.equal(survey.closed, false);

          let updateParams = { id: survey.id, closed: true };
          surveyServices.updateSurvey(updateParams, { accountOwnerId: testAccount.id }).then(function(updatedSurvey) {
            assert.equal(updatedSurvey.id, survey.id);
            assert.equal(updatedSurvey.closed, true);
            done();
          }, function(error) {
            done(error);
          });
        });
      });
    });

    describe('sad path', function() {
      it('should fail finding survey', function (done) {
        let params = surveyParams();

        surveyServices.createSurveyWithQuestions(params).then(function(survey) {
          let updateParams = { id: survey.id + 1, closed: true };
          surveyServices.updateSurvey(updateParams, { accountOwnerId: testAccount.id }).then(function(updatedSurvey) {
            done('Should not get here!');
          }, function(error) {
            assert.equal(error, 'Survey not found');
            done();
          });
        });
      });

      it('should fail updating not valid values', function (done) {
        let params = surveyParams();

        surveyServices.createSurveyWithQuestions(params).then(function(survey) {
          let updateParams = { id: survey.id, accountId: testAccount.id + 1 };
          surveyServices.updateSurvey(updateParams, { accountOwnerId: testAccount.id }).then(function(updatedSurvey) {
            assert.equal(updatedSurvey.id, survey.id);
            assert.equal(updatedSurvey.accountId, survey.accountId);
            assert.notEqual(updatedSurvey.accountId, testAccount.id + 1);
            done();
          }, function(error) {
            done(error);
          });
        });
      });
    });
  });

});
