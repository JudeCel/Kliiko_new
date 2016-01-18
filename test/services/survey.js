'use strict';

var models = require('./../../models');
var Survey = models.Survey;
var SurveyQuestion = models.SurveyQuestion;
var SurveyAnswer = models.SurveyAnswer;

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

  function surveyAnswerParams(questions) {
    let params = { SurveyQuestions: {} };
    questions.forEach(function(question, index, array) {
      params.SurveyQuestions[question.id] = { answer: index };
    });

    return params;
  }

  function surveyParams() {
    return {
      name: 'Survey name',
      description: 'Survey description',
      thanks: 'Survey thanks',
      accountId: testAccount.id,
      confirmedAt: new Date(),
      SurveyQuestions: [
        surveyQuestionParams(0),
        surveyQuestionParams(1)
      ]
    };
  };

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
  };

  describe('#createSurveyWithQuestions', function() {
    describe('happy path', function() {
      it('should succeed on creating survey with questions', function (done) {
        let params = surveyParams();

        surveyServices.createSurveyWithQuestions(params).then(function(survey) {
          assert.equal(survey.name, 'Survey name');
          assert.equal(survey.description, 'Survey description');
          assert.equal(survey.thanks, 'Survey thanks');
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
          let allErrors = { accountId: 'Account Id: cannot be null',
            name: 'Name: cannot be null',
            description: 'Description: cannot be null',
            thanks: 'Thanks: cannot be null'
          };

          assert.deepEqual(error, allErrors);
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
          surveyServices.findSurvey({ id: survey.id }, { id: testAccount.id }).then(function(result) {
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
          surveyServices.findSurvey({ id: survey.id + 100 }, { id: testAccount.id }).then(function(result) {
            done('Should not get here!');
          }, function(error) {
            assert.equal(error, 'Survey not found');
            done();
          });
        });
      });

      it('should fail because survey closed', function (done) {
        let params = surveyParams();
        params.closed = true;

        surveyServices.createSurveyWithQuestions(params).then(function(survey) {
          surveyServices.findSurvey({ id: survey.id }, { id: testAccount.id }).then(function(result) {
            done('Should not get here!');
          }, function(error) {
            assert.equal(error, 'Survey closed, please contact admin!');
            done();
          });
        });
      });

      it('should fail because survey not confirmed', function (done) {
        let params = surveyParams();
        delete params.confirmedAt;

        surveyServices.createSurveyWithQuestions(params).then(function(survey) {
          surveyServices.findSurvey({ id: survey.id }, { id: testAccount.id }).then(function(result) {
            done('Should not get here!');
          }, function(error) {
            assert.equal(error, 'Survey not confirmed, please contact admin!');
            done();
          });
        });
      });
    });
  });

  describe('#findAllSurveys', function() {
    it('should succeed on finding 0 surveys', function (done) {
      surveyServices.findAllSurveys({ id: testAccount.id }).then(function(surveys) {
        assert.deepEqual(surveys, []);
        done();
      }, function(error) {
        done(error);
      });
    });

    it('should succeed on finding all surveys', function (done) {
      let params = surveyParams();

      surveyServices.createSurveyWithQuestions(params).then(function(survey) {
        surveyServices.findAllSurveys({ id: testAccount.id }).then(function(surveys) {
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

          surveyServices.changeStatus({ id: survey.id, closed: true }, { id: testAccount.id }).then(function(survey) {
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

          surveyServices.changeStatus({ id: survey.id + 100, closed: true }, { id: testAccount.id }).then(function(survey) {
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

          surveyServices.updateSurvey(params, { id: testAccount.id }).then(function(updatedSurvey) {
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

          surveyServices.updateSurvey(params, { id: testAccount.id }).then(function(updatedSurvey) {
            surveyServices.findSurvey({ id: updatedSurvey.id }, { id: testAccount.id }).then(function(survey) {
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

          surveyServices.updateSurvey(params, { id: testAccount.id }).then(function(updatedSurvey) {
            surveyServices.findSurvey({ id: updatedSurvey.id }, { id: testAccount.id }).then(function(survey) {
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

          surveyServices.updateSurvey(params, { id: testAccount.id }).then(function(updatedSurvey) {
            surveyServices.findSurvey({ id: updatedSurvey.id }, { id: testAccount.id }).then(function(survey) {
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
          let updateParams = { id: survey.id + 100, closed: true };
          surveyServices.updateSurvey(updateParams, { id: testAccount.id }).then(function(updatedSurvey) {
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
          surveyServices.updateSurvey(updateParams, { id: testAccount.id }).then(function(updatedSurvey) {
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
          surveyServices.removeSurvey({ id: survey.id }, { id: testAccount.id }).then(function(result) {
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
          surveyServices.removeSurvey({ id: survey.id + 100 }, { id: testAccount.id }).then(function(survey) {
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
          surveyServices.copySurvey({ id: survey.id }, { id: testAccount.id }).then(function(copy) {
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
          surveyServices.copySurvey({ id: survey.id + 100 }, { id: testAccount.id }).then(function(survey) {
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

  describe('#answerSurvey', function() {
    describe('happy path', function() {
      it('should succeed on answering questions', function (done) {
        let params = surveyParams();

        surveyServices.createSurveyWithQuestions(params).then(function(survey) {
          SurveyQuestion.findAll().then(function(questions) {
            let answerParams = surveyAnswerParams(questions);
            answerParams.surveyId = survey.id;

            surveyServices.answerSurvey(answerParams).then(function(result) {
              assert.equal(result, 'Successfully completed survey!');

              SurveyAnswer.count().then(function(c) {
                assert.equal(c, 1);
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

  describe('#confirmSurvey', function() {
    describe('happy path', function() {
      it('should succeed on confirming survey', function (done) {
        let params = surveyParams();
        delete params.confirmedAt;

        surveyServices.createSurveyWithQuestions(params).then(function(survey) {
          let date = new Date();
          surveyServices.confirmSurvey({ id: survey.id, confirmedAt: date }, { id: testAccount.id }).then(function(survey) {
            assert.deepEqual(survey.confirmedAt, date);
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
          let date = new Date();
          surveyServices.confirmSurvey({ id: survey.id + 100, confirmedAt: date }, { id: testAccount.id }).then(function(survey) {
            done('Should not get here!');
          }, function(error) {
            assert.equal(error, 'Survey not found');
            done();
          });
        });
      });
    });
  });

  describe('#exportSurvey', function() {
    describe('happy path', function() {
      it('should succeed on confirming survey', function (done) {
        let params = surveyParams();
        delete params.confirmedAt;

        surveyServices.createSurveyWithQuestions(params).then(function(survey) {
          let answerParams = surveyAnswerParams(survey.SurveyQuestions);
          answerParams.surveyId = survey.id;

          surveyServices.answerSurvey(answerParams).then(function(result) {
            surveyServices.exportSurvey({ id: survey.id }, { id: testAccount.id }).then(function(result) {
              let validResult = {
                header: [ 'Some default name 0', 'Some default name 1' ],
                data: [{
                  'Some default name 0': '0 answer 0',
                  'Some default name 1': '1 answer 1'
                }]
              };

              assert.deepEqual(result, validResult);
              done();
            }, function(error) {
              done(error);
            });
          });
        });
      });
    });

    describe('sad path', function() {
      it('should fail on finding survey', function (done) {
        let params = surveyParams();

        surveyServices.createSurveyWithQuestions(params).then(function(survey) {
          surveyServices.exportSurvey({ id: survey.id + 100 }, { id: testAccount.id }).then(function(result) {
            done('Should not get here!');
          }, function(error) {
            assert.equal(error, 'Survey not found');
            done();
          });
        });
      });
    });
  });
});
