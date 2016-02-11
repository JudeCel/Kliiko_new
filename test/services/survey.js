'use strict';

var models = require('./../../models');
var Survey = models.Survey;
var SurveyQuestion = models.SurveyQuestion;
var SurveyAnswer = models.SurveyAnswer;
var ContactList = models.ContactList;
var ContactListUser = models.ContactListUser;

var surveyConstants = require('../../util/surveyConstants');
var surveyServices = require('./../../services/survey');
var userFixture = require('./../fixtures/user');
var assert = require('chai').assert;
var _ = require('lodash');

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

  function accountParams() {
    return { id: testAccount.id };
  };

  function surveyAnswerParams(questions) {
    let params = { SurveyQuestions: {} };
    _.map(questions, function(question) {
      _.map(question.answers, function(answer) {
        if(answer.contactDetails) {
          params.SurveyQuestions[question.id] = {
            answer: true,
            contactDetails: {
              firstName: 'firstName',
              lastName: 'lastName',
              gender: 'male',
              age: 20,
              email: 'some@email.com',
              mobile: '+371 2222222',
              postalAddress: 'postalAddress',
              country: 'Latvia'
            }
          };
        }
        else {
          params.SurveyQuestions[question.id] = { answer: answer.order };
        }
      });
    });

    return params;
  };

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

  function surveyQuestionContactList() {
    return {
      "name":"Contact details",
      "type":"checkbox",
      "question":"Would you like to share you contact details?",
      "order":8,
      "answers":[
        {
          "name":"No problemo, amigo",
          "order":0,
          "contactDetails":[
            { order: 0, "model": "firstName", "name":"First Name", "input":true },
            { order: 1, "model": "lastName", "name":"Last Name", "input":true },
            { order: 2, "model": "gender", "name":"Gender", "select":true, "options":[ "male", "female" ] },
            { order: 3, "model": "age", "name":"Age", "input":true },
            { order: 4, "model": "email", "name":"Email", "input":true },
            { order: 5, "model": "mobile", "name":"Mobile", "input":true },
            { order: 6, "model": "postalAddress", "name":"Postal Address", "input":true, },
            { order: 7, "model": "country", "name":"Country", "input":true, }
          ]
        }
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
  };

  describe('#createSurveyWithQuestions', function() {
    describe('happy path', function() {
      it('should succeed on creating survey with questions', function (done) {

        ContactList.count().then(function(c) {
          assert.equal(c, 3);

          let params = surveyParams();
          surveyServices.createSurveyWithQuestions(params, accountParams()).then(function(result) {
            let survey = result.data;

            assert.equal(result.message, surveyServices.messages.created);
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

            ContactList.count().then(function(c) {
              assert.equal(c, 4);
              done();
            });
          }, function(error) {
            done(error);
          });
        });
      });
    });

    describe('sad path', function() {
      it('should fail without params', function (done) {
        surveyServices.createSurveyWithQuestions({}, accountParams()).then(function(result) {
          done('Should not get here!');
        }, function(error) {
          let allErrors = {
            name: "Name can't be empty",
            description: "Description can't be empty",
            thanks: "Thanks can't be empty"
          };

          assert.deepEqual(error, allErrors);
          ContactList.count().then(function(c) {
            assert.equal(c, 3);
            done();
          });
        });
      });

      it('should fail on creating questions with wrong params', function (done) {
        let params = surveyParams();
        params.SurveyQuestions[0].name = '';

        surveyServices.createSurveyWithQuestions(params, accountParams()).then(function(result) {
          done('Should not get here!');
        }, function(error) {
          assert.deepEqual(error, { name: "Name can't be empty" });

          Survey.count().then(function(c) {
            assert.equal(c, 0);

            ContactList.count().then(function(c) {
              assert.equal(c, 3);
              done();
            });
          })
        });
      });
    });
  });

  describe('#findSurvey', function() {
    describe('happy path', function() {
      it('should succeed on finding survey', function (done) {
        let params = surveyParams();

        surveyServices.createSurveyWithQuestions(params, accountParams()).then(function(result) {
          let survey = result.data;

          surveyServices.findSurvey({ id: survey.id }, accountParams()).then(function(result) {
            assert.equal(result.data.id, survey.id);
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

        surveyServices.createSurveyWithQuestions(params, accountParams()).then(function(result) {
          let survey = result.data;

          surveyServices.findSurvey({ id: survey.id + 100 }, accountParams()).then(function(result) {
            done('Should not get here!');
          }, function(error) {
            assert.equal(error, surveyServices.messages.notFound);
            done();
          });
        });
      });

      it('should fail because survey closed', function (done) {
        let params = surveyParams();
        params.closed = true;

        surveyServices.createSurveyWithQuestions(params, accountParams()).then(function(result) {
          let survey = result.data;

          surveyServices.findSurvey({ id: survey.id }, accountParams()).then(function(result) {
            done('Should not get here!');
          }, function(error) {
            assert.equal(error, surveyServices.messages.alreadyClosed);
            done();
          });
        });
      });

      it('should fail because survey not confirmed', function (done) {
        let params = surveyParams();
        delete params.confirmedAt;

        surveyServices.createSurveyWithQuestions(params, accountParams()).then(function(result) {
          let survey = result.data;
          surveyServices.findSurvey({ id: survey.id }, accountParams()).then(function(result) {
            done('Should not get here!');
          }, function(error) {
            assert.equal(error, surveyServices.messages.notConfirmed);
            done();
          });
        });
      });
    });
  });

  describe('#findAllSurveys', function() {
    it('should succeed on finding 0 surveys', function (done) {
      surveyServices.findAllSurveys(accountParams()).then(function(result) {
        assert.deepEqual(result.data, []);
        done();
      }, function(error) {
        done(error);
      });
    });

    it('should succeed on finding all surveys', function (done) {
      let params = surveyParams();

      surveyServices.createSurveyWithQuestions(params, accountParams()).then(function(result) {
        let survey = result.data;

        surveyServices.findAllSurveys(accountParams()).then(function(result) {
          assert.equal(result.data[0].id, survey.id);
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

        surveyServices.createSurveyWithQuestions(params, accountParams()).then(function(result) {
          let survey = result.data;
          assert.equal(survey.closed, false);

          surveyServices.changeStatus({ id: survey.id, closed: true }, accountParams()).then(function(result) {
            assert.equal(result.message, surveyServices.messages.closed);
            assert.equal(result.data.closed, true);
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

        surveyServices.createSurveyWithQuestions(params, accountParams()).then(function(result) {
          let survey = result.data;
          assert.equal(survey.closed, false);

          surveyServices.changeStatus({ id: survey.id + 100, closed: true }, accountParams()).then(function(result) {
            done('Should not get here!');
          }, function(error) {
            assert.equal(error, surveyServices.messages.notFound);
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

        surveyServices.createSurveyWithQuestions(params, accountParams()).then(function(result) {
          let survey = result.data;
          assert.equal(survey.closed, false);

          params.id = survey.id;
          params.closed = true;

          surveyServices.updateSurvey(params, accountParams()).then(function(result) {
            assert.equal(result.message, surveyServices.messages.updated);
            assert.equal(result.data.id, survey.id);
            assert.equal(result.data.closed, true);
            done();
          }, function(error) {
            done(error);
          });
        });
      });

      it('should remove surveys question', function (done) {
        let params = surveyParams();

        surveyServices.createSurveyWithQuestions(params, accountParams()).then(function(result) {
          let survey = result.data;
          assert.equal(survey.SurveyQuestions.length, 2);

          params.id = survey.id;
          params.SurveyQuestions.splice(1, 1);
          params.SurveyQuestions[0].id = survey.SurveyQuestions[0].id;
          params.SurveyQuestions[0].surveyId = survey.SurveyQuestions[0].surveyId;

          surveyServices.updateSurvey(params, accountParams()).then(function(result) {
            let updatedSurvey = result.data;
            assert.equal(result.message, surveyServices.messages.updated);

            surveyServices.findSurvey({ id: updatedSurvey.id }, accountParams()).then(function(result) {
              assert.equal(result.data.id, updatedSurvey.id);
              assert.equal(result.data.SurveyQuestions.length, 1);
              done();
            });
          }, function(error) {
            done(error);
          });
        });
      });

      it('should update surveys first question', function (done) {
        let params = surveyParams();

        surveyServices.createSurveyWithQuestions(params, accountParams()).then(function(result) {
          let survey = result.data;
          assert.equal(survey.SurveyQuestions.length, 2);

          params.id = survey.id;
          params.SurveyQuestions[0].id = survey.SurveyQuestions[0].id;
          params.SurveyQuestions[0].surveyId = survey.SurveyQuestions[0].surveyId;
          params.SurveyQuestions[1].id = survey.SurveyQuestions[1].id;
          params.SurveyQuestions[1].surveyId = survey.SurveyQuestions[1].surveyId;
          params.SurveyQuestions[0].name = 'Changed name';

          surveyServices.updateSurvey(params, accountParams()).then(function(result) {
            let updatedSurvey = result.data;
            assert.equal(result.message, surveyServices.messages.updated);

            surveyServices.findSurvey({ id: updatedSurvey.id }, accountParams()).then(function(result) {
              assert.equal(result.data.id, updatedSurvey.id);
              assert.equal(result.data.SurveyQuestions.length, 2);
              assert.equal(result.data.SurveyQuestions[0].name, 'Changed name');
              done();
            });
          }, function(error) {
            done(error);
          });
        });
      });

      it('should add another surveys question', function (done) {
        let params = surveyParams();

        surveyServices.createSurveyWithQuestions(params, accountParams()).then(function(result) {
          let survey = result.data;
          assert.equal(survey.SurveyQuestions.length, 2);

          params.id = survey.id;
          params.SurveyQuestions.splice(1, 1);

          surveyServices.updateSurvey(params, accountParams()).then(function(result) {
            let updatedSurvey = result.data;
            assert.equal(result.message, surveyServices.messages.updated);

            surveyServices.findSurvey({ id: updatedSurvey.id }, accountParams()).then(function(result) {
              assert.equal(result.data.id, updatedSurvey.id);
              assert.equal(result.data.SurveyQuestions.length, 3);
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

        surveyServices.createSurveyWithQuestions(params, accountParams()).then(function(result) {
          let survey = result.data;
          let updateParams = { id: survey.id + 100, closed: true };

          surveyServices.updateSurvey(updateParams, accountParams()).then(function(result) {
            done('Should not get here!');
          }, function(error) {
            assert.equal(error, surveyServices.messages.notFound);
            done();
          });
        });
      });

      it('should fail updating not valid values', function (done) {
        let params = surveyParams();

        surveyServices.createSurveyWithQuestions(params, accountParams()).then(function(result) {
          let survey = result.data;
          let updateParams = { id: survey.id, name: '' };
          surveyServices.updateSurvey(updateParams, accountParams()).then(function(result) {
            done('Should not get here!');
          }, function(error) {
            assert.deepEqual(error.name, "Name can't be empty");
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

        surveyServices.createSurveyWithQuestions(params, accountParams()).then(function(result) {
          let survey = result.data;

          surveyServices.removeSurvey({ id: survey.id }, accountParams()).then(function(result) {
            assert.equal(result.message, surveyServices.messages.removed);
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

        surveyServices.createSurveyWithQuestions(params, accountParams()).then(function(result) {
          let survey = result.data;

          surveyServices.removeSurvey({ id: survey.id + 100 }, accountParams()).then(function(result) {
            done('Should not get here!');
          }, function(error) {
            assert.equal(error, surveyServices.messages.notFound);
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

        surveyServices.createSurveyWithQuestions(params, accountParams()).then(function(result) {
          let survey = result.data;

          surveyServices.copySurvey({ id: survey.id }, accountParams()).then(function(result) {
            assert.notEqual(result.data.id, survey.id);

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

        surveyServices.createSurveyWithQuestions(params, accountParams()).then(function(result) {
          let survey = result.data;

          surveyServices.copySurvey({ id: survey.id + 100 }, accountParams()).then(function(result) {
            done('Should not get here!');
          }, function(error) {
            assert.equal(error, surveyServices.messages.notFound);
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

        surveyServices.createSurveyWithQuestions(params, accountParams()).then(function(result) {
          let survey = result.data;

          SurveyQuestion.findAll().then(function(results) {
            let answerParams = surveyAnswerParams(results);
            answerParams.surveyId = survey.id;

            surveyServices.answerSurvey(answerParams).then(function(result) {
              assert.equal(result.message, surveyServices.messages.completed);

              SurveyAnswer.count().then(function(c) {
                assert.equal(c, 1);

                ContactListUser.count().then(function(c) {
                  assert.equal(c, 0);
                  done();
                });
              });
            }, function(error) {
              done(error);
            });
          });
        });
      });

      it('should succeed on answering with contact list', function (done) {
        let params = surveyParams();
        params.SurveyQuestions.push(surveyQuestionContactList());

        ContactListUser.count().then(function(c) {
          assert.equal(c, 0);

          surveyServices.createSurveyWithQuestions(params, accountParams()).then(function(result) {
            let survey = result.data;

            SurveyQuestion.findAll().then(function(results) {
              let answerParams = surveyAnswerParams(results);
              answerParams.surveyId = survey.id;

              surveyServices.answerSurvey(answerParams).then(function(result) {
                assert.equal(result.message, surveyServices.messages.completed);

                SurveyAnswer.count().then(function(c) {
                  assert.equal(c, 1);

                  ContactListUser.count().then(function(c) {
                    assert.equal(c, 1);
                    done();
                  });
                });
              }, function(error) {
                done(error);
              });
            });
          });
        });
      });
    });

    describe('sad path', function() {
      it('should fail on account user validations', function (done) {
        let params = surveyParams();
        params.SurveyQuestions.push(surveyQuestionContactList());

        ContactListUser.count().then(function(c) {
          assert.equal(c, 0);

          surveyServices.createSurveyWithQuestions(params, accountParams()).then(function(result) {
            let survey = result.data;

            SurveyQuestion.findAll().then(function(results) {
              let answerParams = surveyAnswerParams(results);
              answerParams.surveyId = survey.id;
              answerParams.SurveyQuestions[3].contactDetails.email = 'invalidEmail';

              surveyServices.answerSurvey(answerParams).then(function(result) {
                done('Should not get here!');
              }, function(error) {
                assert.deepEqual(error, { email: 'Invalid e-mail format' });
                done();
              });
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

        surveyServices.createSurveyWithQuestions(params, accountParams()).then(function(result) {
          let survey = result.data;
          let date = new Date();

          surveyServices.confirmSurvey({ id: survey.id, confirmedAt: date }, accountParams()).then(function(result) {
            assert.deepEqual(result.data.confirmedAt, date);
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

        surveyServices.createSurveyWithQuestions(params, accountParams()).then(function(result) {
          let survey = result.data;
          let date = new Date();

          surveyServices.confirmSurvey({ id: survey.id + 100, confirmedAt: date }, accountParams()).then(function(result) {
            done('Should not get here!');
          }, function(error) {
            assert.equal(error, surveyServices.messages.notFound);
            done();
          });
        });
      });
    });
  });

  describe('#exportSurvey', function() {
    describe('happy path', function() {
      it('should succeed on exporting survey', function (done) {
        let params = surveyParams();
        delete params.confirmedAt;

        surveyServices.createSurveyWithQuestions(params, accountParams()).then(function(result) {
          let survey = result.data;
          let answerParams = surveyAnswerParams(survey.SurveyQuestions);
          answerParams.surveyId = survey.id;

          surveyServices.answerSurvey(answerParams).then(function(result) {
            surveyServices.exportSurvey({ id: survey.id }, accountParams()).then(function(result) {
              let validResult = {
                header: [ 'Some default name 0', 'Some default name 1' ],
                data: [{
                  'Some default name 0': '3 answer 0',
                  'Some default name 1': '3 answer 1'
                }]
              };

              assert.deepEqual(result.data, validResult);
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

        surveyServices.createSurveyWithQuestions(params, accountParams()).then(function(result) {
          let survey = result.data;

          surveyServices.exportSurvey({ id: survey.id + 100 }, accountParams()).then(function(result) {
            done('Should not get here!');
          }, function(error) {
            assert.equal(error, surveyServices.messages.notFound);
            done();
          });
        });
      });
    });
  });

  describe('#constantsSurvey', function() {
    describe('happy path', function() {
      it('should succeed returning default values', function (done) {
        surveyServices.constantsSurvey().then(function(result) {
          assert.deepEqual(result.data, surveyConstants);
          done();
        }, function(error) {
          done(error);
        });
      });
    });
  });
});
