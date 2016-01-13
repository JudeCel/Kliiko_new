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
      description: 'Survey description',
      accountId: testAccount.id,
      SurveyQuestions: [
        surveyQuestionParams(0),
        surveyQuestionParams(1)
      ]
    };
  }

  function surveyQuestionParams(random) {
    return {
      type: 'radio',
      order: random,
      name: 'Some default name ' + random,
      question: 'What a default question ' + random,
      answers: [
        {
          order: 0,
          name: '0 answer ' + random
        },
        {
          order: 1,
          name: '1 answer ' + random
        },
        {
          order: 2,
          name: '2 answer ' + random
        },
        {
          order: 3,
          name: '3 answer ' + random
        }
      ]
    };
  }

  describe('#createSurveyWithQuestions', function() {
    describe('happy path', function() {
      it('should succeed on creating survey with questions', function (done) {
        let params = surveyParams();

        surveyServices.createSurveyWithQuestions(params).then(function(survey) {
          assert.equal(survey.name, 'Survey name');
          assert.equal(survey.description, 'Survey description');
          assert.equal(survey.accountId, testAccount.id);

          assert.equal(survey.SurveyQuestions[0].type, params.SurveyQuestions[0].type);
          assert.equal(survey.SurveyQuestions[0].order, params.SurveyQuestions[0].order);
          assert.equal(survey.SurveyQuestions[0].name, params.SurveyQuestions[0].name);
          assert.equal(survey.SurveyQuestions[0].question, params.SurveyQuestions[0].question);
          assert.deepEqual(survey.SurveyQuestions[0].answers, params.SurveyQuestions[0].answers);

          assert.equal(survey.SurveyQuestions[1].type, params.SurveyQuestions[1].type);
          assert.equal(survey.SurveyQuestions[1].order, params.SurveyQuestions[1].order);
          assert.equal(survey.SurveyQuestions[1].name, params.SurveyQuestions[1].name);
          assert.equal(survey.SurveyQuestions[1].question, params.SurveyQuestions[1].question);
          assert.deepEqual(survey.SurveyQuestions[1].answers, params.SurveyQuestions[1].answers);
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
          assert.deepEqual(error, { accountId: 'Account Id: cannot be null', name: 'Name: cannot be null', description: 'Description: cannot be null' });
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

  describe('#changeStatus', function() {
    describe('happy path', function() {
      it('should succeed on changing status', function (done) {
        let params = surveyParams();

        surveyServices.createSurveyWithQuestions(params).then(function(survey) {
          assert.equal(survey.closed, false);

          surveyServices.changeStatus({ id: survey.id, closed: true }, { accountOwnerId: testAccount.id }).then(function(survey) {
            assert.equal(survey.closed, true);
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
          assert.equal(survey.closed, false);

          surveyServices.changeStatus({ id: survey.id + 100, closed: true }, { accountOwnerId: testAccount.id }).then(function(survey) {
            done('Should not get here!');
          }, function(error) {
            assert.equal(error, 'Survey not found');
            done();
          });
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

          params.id = survey.id;
          params.closed = true;

          surveyServices.updateSurvey(params, { accountOwnerId: testAccount.id }).then(function(updatedSurvey) {
            assert.equal(updatedSurvey.id, survey.id);
            assert.equal(updatedSurvey.closed, true);
            done();
          }, function(error) {
            done(error);
          });
        });
      });

      it('should remove surveys question', function (done) {
        let params = surveyParams();

        surveyServices.createSurveyWithQuestions(params).then(function(survey) {
          assert.equal(survey.SurveyQuestions.length, 2);

          params.id = survey.id;
          params.SurveyQuestions.splice(1, 1);
          params.SurveyQuestions[0].id = survey.SurveyQuestions[0].id;
          params.SurveyQuestions[0].surveyId = survey.SurveyQuestions[0].surveyId;

          surveyServices.updateSurvey(params, { accountOwnerId: testAccount.id }).then(function(updatedSurvey) {
            surveyServices.findSurvey(updatedSurvey.id).then(function(survey) {
              assert.equal(updatedSurvey.id, survey.id);
              assert.equal(survey.SurveyQuestions.length, 1);
              done();
            });
          }, function(error) {
            done(error);
          });
        });
      });

      it('should update surveys first question', function (done) {
        let params = surveyParams();

        surveyServices.createSurveyWithQuestions(params).then(function(survey) {
          assert.equal(survey.SurveyQuestions.length, 2);

          params.id = survey.id;
          params.SurveyQuestions[0].id = survey.SurveyQuestions[0].id;
          params.SurveyQuestions[0].surveyId = survey.SurveyQuestions[0].surveyId;
          params.SurveyQuestions[1].id = survey.SurveyQuestions[1].id;
          params.SurveyQuestions[1].surveyId = survey.SurveyQuestions[1].surveyId;
          params.SurveyQuestions[0].name = 'Changed name';

          surveyServices.updateSurvey(params, { accountOwnerId: testAccount.id }).then(function(updatedSurvey) {
            surveyServices.findSurvey(updatedSurvey.id).then(function(survey) {
              assert.equal(updatedSurvey.id, survey.id);
              assert.equal(survey.SurveyQuestions.length, 2);
              assert.equal(survey.SurveyQuestions[0].name, 'Changed name');
              done();
            });
          }, function(error) {
            done(error);
          });
        });
      });

      it('should add another surveys question', function (done) {
        let params = surveyParams();

        surveyServices.createSurveyWithQuestions(params).then(function(survey) {
          assert.equal(survey.SurveyQuestions.length, 2);

          params.id = survey.id;
          params.SurveyQuestions.splice(1, 1);

          surveyServices.updateSurvey(params, { accountOwnerId: testAccount.id }).then(function(updatedSurvey) {
            surveyServices.findSurvey(updatedSurvey.id).then(function(survey) {
              assert.equal(updatedSurvey.id, survey.id);
              assert.equal(survey.SurveyQuestions.length, 3);
              done();
            });
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
          let updateParams = { id: survey.id, name: '' };
          surveyServices.updateSurvey(updateParams, { accountOwnerId: testAccount.id }).then(function(updatedSurvey) {
            done('Should not get here!');
          }, function(error) {
            assert.deepEqual(error, { name: "Name:can't be empty" });
            done();
          });
        });
      });
    });
  });

  describe('#removeSurvey', function() {
    describe('happy path', function() {
      it('should succeed on deleting survey', function (done) {
        let params = surveyParams();

        surveyServices.createSurveyWithQuestions(params).then(function(survey) {
          surveyServices.removeSurvey(survey.id, { accountOwnerId: testAccount.id }).then(function(result) {
            assert.equal(result, 'Successfully removed survey');
            Survey.count().then(function(c) {
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
      it('should fail on finding survey', function (done) {
        let params = surveyParams();

        surveyServices.createSurveyWithQuestions(params).then(function(survey) {
          surveyServices.removeSurvey(survey.id + 100, { accountOwnerId: testAccount.id }).then(function(survey) {
            done('Should not get here!');
          }, function(error) {
            assert.equal(error, 'Survey not found');
            Survey.count().then(function(c) {
              assert.equal(c, 1);
              done();
            });
          });
        });
      });
    });
  });

  describe('#copySurvey', function() {
    describe('happy path', function() {
      it('should succeed on changing status', function (done) {
        let params = surveyParams();

        surveyServices.createSurveyWithQuestions(params).then(function(survey) {
          surveyServices.copySurvey(survey).then(function(copy) {
            assert.notEqual(copy.id, survey.id);

            Survey.count().then(function(c) {
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
      it('should fail on finding survey', function (done) {
        let params = surveyParams();

        surveyServices.createSurveyWithQuestions(params).then(function(survey) {
          surveyServices.copySurvey(survey.id + 100, { accountOwnerId: testAccount.id }).then(function(survey) {
            done('Should not get here!');
          }, function(error) {
            assert.equal(error, 'Survey not found');
            Survey.count().then(function(c) {
              assert.equal(c, 1);
              done();
            });
          });
        });
      });
    });
  });

});
