'use strict';

var models = require('./../../models');
var Survey = models.Survey;
var SurveyQuestion = models.SurveyQuestion;
var SurveyAnswer = models.SurveyAnswer;
var ContactList = models.ContactList;
var ContactListUser = models.ContactListUser;

var surveyConstants = require('../../util/surveyConstants');
var surveyServices = require('./../../services/survey');
var subscriptionFixture = require('./../fixtures/subscription');
var userFixture = require('./../fixtures/user');

var assert = require('chai').assert;
var _ = require('lodash');

describe('SERVICE - Survey', function() {
  var testData;

  beforeEach(function(done) {
    models.sequelize.sync({ force: true }).then(() => {
      userFixture.createUserAndOwnerAccount().then(function(result) {
        testData = result;
        subscriptionFixture.createSubscription(testData.account.id, testData.user.id).then(function(subscription) {
          models.SubscriptionPreference.update({'data.contactListCount': 5, 'data.surveyCount': 5, 'data.exportRecruiterSurveyData': true, 'data.exportRecruiterStats': true}, { where: { subscriptionId: subscription.id } }).then(function() {
            done();
          }, function(error) {
            done(error);
          })
        }, function(error) {
          done(error);
        })
      }).catch(function(error) {
        done(error);
      });
    });
  });

  function surveyAnswerParams(questions) {
    let params = { SurveyQuestions: {} };
    _.map(questions, function(question) {
      _.map(question.answers, function(answer) {
        if(answer.contactDetails) {
          params.SurveyQuestions[question.id] = {
            tagHandled: true,
            contactDetails: {
              firstName: 'firstName',
              lastName: 'lastName',
              gender: 'male',
              age: '30-34',
              email: 'some@email.com',
              mobile: '+371 2222222',
              postalAddress: 'postalAddress',
              country: 'Latvia'
            }
          };
        } else {
          params.SurveyQuestions[question.id] = { answer: 0 };
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
      accountId: testData.account.id,
      confirmedAt: new Date(),
      SurveyQuestions: [
        surveyQuestionParams(0),
        surveyQuestionParams(1)
      ]
    };
  };

  function surveyQuestionContactListConfirm() {
    return {
      "name":"Interest",
      "type":"radio",
      "question":"Would you like to share you contact details?",
      "order":7,
      "answers":[
        {
          order: 0,
          tag: 'InterestYesTag',
          name: 'Yes'
        },
        {
          order: 1,
          name: 'No'
        }
      ]
    };
  }

  function surveyQuestionContactList() {
    return {
      "name":"Contact Details",
      "type":"input",
      "question":"If you answered Yes, please complete your Contact Details",
      "order":8,
      "handleTag": 'InterestYesTag',

      "answers":[
        {
          "contactDetails": {
            firstName: { model: 'firstName', name: 'First Name', input: true, order: 0 },
            lastName: { model: 'lastName', name: 'Last Name', input: true, order: 1 },
            gender: { model: 'gender',
               name: 'Gender',
               select: true,
               options: [ 'male', 'female' ],
               order: 2 },
            age: { model: 'age',
               name: 'Age',
               select: true,
               options: [
                  'Under 18',
                  '18-19',
                  '20-24',
                  '25-29',
                  '30-34',
                  '35-39',
                  '40-44',
                  '45-49',
                  '50-54',
                  '55-59',
                  '60-64',
                  '65-69',
                  '70+' ],
               order: 3 },
            email: { model: 'email', name: 'Email', input: true, order: 4 },
            mobile: { model: 'mobile',
               name: 'Mobile',
               number: true,
               canDisable: true,
               order: 5 }
            },
          'handleTag': 'InterestYesTag'
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
          try {
            assert.equal(c, 3);
          } catch (e) {
            done(e)
          }
          let params = surveyParams();

          surveyServices.createSurveyWithQuestions(params, testData.account).then(function(result) {
            let survey = result.data;
            try {
              assert.equal(result.message, surveyServices.messages.created);
              assert.equal(survey.name, 'Survey name');
              assert.equal(survey.description, 'Survey description');
              assert.equal(survey.thanks, 'Survey thanks');
              assert.equal(survey.accountId, testData.account.id);

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
            } catch (e) {
              done(e)
            }

            ContactList.count().then((c) =>{
              try {
                assert.equal(c, 4);
                done();
              } catch (e) {
                done(e);
              }
            });
          }, (error) => {
            done(error);
          });
        });
      });
      it("delete contact list keep survey", (done) =>{
        let params = surveyParams();
        surveyServices.createSurveyWithQuestions(params, testData.account).then((result) => {
          let survey = result.data;
          ContactList.count().then((c) =>{
            try {
              assert.equal(c, 4);
                ContactList.destroy({where: {id: survey.contactListId}}).then((result) => {
                  assert.equal(result, 1)
                  Survey.find({where: {id: survey.id}}).then((sureveyFromDB) => {
                    if (sureveyFromDB) {
                      done();
                    } else {
                    done("Survey is misssing");
                    }
                  });
                  })
            } catch (e) {
              done(e);
            }
          });
        });
      });
      
      it("delete survey keep contact list", (done) =>{
        let params = surveyParams();
        surveyServices.createSurveyWithQuestions(params, testData.account).then((result) => {
          let survey = result.data;
          ContactList.count().then((c) =>{
            try {
              assert.equal(c, 4);
              survey.destroy().then(() => {
                ContactList.find({where: {id: survey.contactListId}}).then((contactList) => {
                  if (contactList) {
                    done();
                  } else {
                  done("Contact List is misssing");
                  } 
                })
              })
            } catch (e) {
              done(e);
            }
          });
        });
      });
    });

    describe('sad path', function() {
      it('should fail without params', function (done) {
        surveyServices.createSurveyWithQuestions({}, testData.account).then(function(result) {
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

        surveyServices.createSurveyWithQuestions(params, testData.account).then(function(result) {
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

        surveyServices.createSurveyWithQuestions(params, testData.account).then(function(result) {
          let survey = result.data;

          surveyServices.findSurvey({ id: survey.id }).then(function(result) {
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

        surveyServices.createSurveyWithQuestions(params, testData.account).then(function(result) {
          let survey = result.data;

          surveyServices.findSurvey({ id: survey.id + 100 }).then(function(result) {
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

        surveyServices.createSurveyWithQuestions(params, testData.account).then(function(result) {
          let survey = result.data;

          surveyServices.findSurvey({ id: survey.id }).then(function(result) {
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

        surveyServices.createSurveyWithQuestions(params, testData.account).then(function(result) {
          let survey = result.data;
          surveyServices.findSurvey({ id: survey.id }).then(function(result) {
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
      surveyServices.findAllSurveys(testData.account).then(function(result) {
        assert.deepEqual(result.data, []);
        done();
      }, function(error) {
        done(error);
      });
    });

    it('should succeed on finding all surveys', function (done) {
      let params = surveyParams();

      surveyServices.createSurveyWithQuestions(params, testData.account).then(function(result) {
        let survey = result.data;

        surveyServices.findAllSurveys(testData.account).then(function(result) {
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

        surveyServices.createSurveyWithQuestions(params, testData.account).then(function(result) {
          let survey = result.data;
          assert.equal(survey.closed, false);

          surveyServices.changeStatus({ id: survey.id, closed: true }, testData.account).then(function(result) {
            assert.equal(result.message, "Survey has been successfully closed!");
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

        surveyServices.createSurveyWithQuestions(params, testData.account).then(function(result) {
          let survey = result.data;
          assert.equal(survey.closed, false);

          surveyServices.changeStatus({ id: survey.id + 100, closed: true }, testData.account).then(function(result) {
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

        surveyServices.createSurveyWithQuestions(params, testData.account).then((result) => {
          let survey = result.data;
          try {
            assert.equal(survey.closed, false);
          } catch (error) {
            return done(error);
          }

          params.id = survey.id;
          params.closed = true;

          surveyServices.updateSurvey(params, testData.account).then((updateSurvey) => {
            try {
              assert.equal(updateSurvey.message, surveyServices.messages.updated);
              assert.equal(updateSurvey.data.id, survey.id);
              assert.equal(updateSurvey.data.closed, true);
              done();
            } catch (error) {
              done(error)
            }
          }, (error) =>  {
            done(error);
          });
        }, (error) => {
          done(error)
        });
      });

      it('should remove surveys question', function (done) {
        let params = surveyParams();

        surveyServices.createSurveyWithQuestions(params, testData.account).then(function(result) {
          let survey = result.data;
          assert.equal(survey.SurveyQuestions.length, 2);

          params.id = survey.id;
          params.SurveyQuestions.splice(1, 1);
          params.SurveyQuestions[0].id = survey.SurveyQuestions[0].id;
          params.SurveyQuestions[0].surveyId = survey.SurveyQuestions[0].surveyId;

          surveyServices.updateSurvey(params, testData.account).then(function(result) {
            let updatedSurvey = result.data;
            assert.equal(result.message, surveyServices.messages.updated);

            surveyServices.findSurvey({ id: updatedSurvey.id }).then(function(result) {
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

        surveyServices.createSurveyWithQuestions(params, testData.account).then(function(result) {
          let survey = result.data;
          assert.equal(survey.SurveyQuestions.length, 2);

          params.id = survey.id;
          params.SurveyQuestions[0].id = survey.SurveyQuestions[0].id;
          params.SurveyQuestions[0].surveyId = survey.SurveyQuestions[0].surveyId;
          params.SurveyQuestions[1].id = survey.SurveyQuestions[1].id;
          params.SurveyQuestions[1].surveyId = survey.SurveyQuestions[1].surveyId;
          params.SurveyQuestions[0].name = 'Changed name';

          surveyServices.updateSurvey(params, testData.account).then(function(result) {
            let updatedSurvey = result.data;
            assert.equal(result.message, surveyServices.messages.updated);

            surveyServices.findSurvey({ id: updatedSurvey.id }).then(function(result) {
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

        surveyServices.createSurveyWithQuestions(params, testData.account).then(function(result) {
          let survey = result.data;
          assert.equal(survey.SurveyQuestions.length, 2);

          params.id = survey.id;
          params.SurveyQuestions.push(params.SurveyQuestions[1]);

          surveyServices.updateSurvey(params, testData.account).then(function(result) {
            let updatedSurvey = result.data;
            assert.equal(result.message, surveyServices.messages.updated);

            surveyServices.findSurvey({ id: updatedSurvey.id }).then(function(result) {
              assert.equal(result.data.id, updatedSurvey.id);
              assert.equal(result.data.SurveyQuestions.length, 3);
              done();
            }, function(error) {
              done(error);
            });
          }, function(error) {
            done(error);
          });
        }, function(error) {
          done(error);
        });
      });
    });

    describe('sad path', function() {
      it('should fail finding survey', function (done) {
        let params = surveyParams();

        surveyServices.createSurveyWithQuestions(params, testData.account).then(function(result) {
          let survey = result.data;
          let updateParams = { id: survey.id + 100, closed: true };

          surveyServices.updateSurvey(updateParams, testData.account).then(function(result) {
            done('Should not get here!');
          }, function(error) {
            assert.equal(error, surveyServices.messages.notFound);
            done();
          });
        });
      });

      it('should fail updating not valid values', function (done) {
        let params = surveyParams();

        surveyServices.createSurveyWithQuestions(params, testData.account).then(function(result) {
          let survey = result.data;
          let updateParams = { id: survey.id, name: '' };
          surveyServices.updateSurvey(updateParams, testData.account).then(function(result) {
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
      it('should succeed on deleting survey and keep contact list', function (done) {
        let params = surveyParams();
        params.confirmedAt = null;

        surveyServices.createSurveyWithQuestions(params, testData.account).then(function(result) {
          let survey = result.data;

          surveyServices.removeSurvey({ id: survey.id }, testData.account).then(function(result) {
            ContactList.find({where: {id: survey.contactListId}}).then((contactList) => {
              Survey.count().then((c) => {
                try {
                  assert.equal(c, 0);
                  assert.equal(result.message, surveyServices.messages.removed);
                  if (contactList) {
                    done();
                  } else {
                  done("Contact List is misssing");
                  } 
                  
                } catch (error) {
                  done(error);
                }
              });
            })
          }, (error) => {
            done(error);
          });
        });
      });
    });

    describe('sad path', function() {
      it('should fail on deleting survey', function (done) {
        let params = surveyParams();

        surveyServices.createSurveyWithQuestions(params, testData.account).then(function(result) {
          let survey = result.data;

          surveyServices.removeSurvey({ id: survey.id }, testData.account).then(function(result) {
            done('Should not get here!');
          }, function(error) {
            done();
          });
        });
      });
    });

    describe('sad path', function() {
      it('should fail on finding survey', function (done) {
        let params = surveyParams();

        surveyServices.createSurveyWithQuestions(params, testData.account).then(function(result) {
          let survey = result.data;

          surveyServices.removeSurvey({ id: survey.id + 100 }, testData.account).then(function(result) {
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

        surveyServices.createSurveyWithQuestions(params, testData.account).then(function(result) {
          let survey = result.data;
          surveyServices.copySurvey({ id: survey.id }, testData.account).then(function(result) {
            try {
              assert.notEqual(result.data.id, survey.id);

              Survey.count().then(function(c) {
                assert.equal(c, 2);
                done();
              });
            } catch (error) {
               done(error);
            }
          }, function(error) {
            done(error);
          });
        });
      });
    });

    describe('sad path', function() {
      it('should fail on finding survey', function (done) {
        let params = surveyParams();

        surveyServices.createSurveyWithQuestions(params, testData.account).then(function(result) {
          let survey = result.data;

          surveyServices.copySurvey({ id: survey.id + 100 }, testData.account).then(function(result) {
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

        surveyServices.createSurveyWithQuestions(params, testData.account).then(function(result) {
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

      it('if delete Contact list save only answere',  (done) => {
        let params = surveyParams();

        surveyServices.createSurveyWithQuestions(params, testData.account).then((result)  =>{
          let survey = result.data;

          SurveyQuestion.findAll().then((results) => {
            let answerParams = surveyAnswerParams(results);
            answerParams.surveyId = survey.id;
            ContactList.destroy({where: {id: survey.contactListId}}).then((result) => {
              surveyServices.answerSurvey(answerParams).then((result) => {
                  SurveyAnswer.count({where: {surveyId: survey.id}}).then((surveyAnswerCount) => {
                    ContactListUser.count({where: {accountUserId: {$ne: testData.accountUser.id}}}).then((contactListUserCount) => {
                      try {
                        assert.equal(result.message, surveyServices.messages.completed);
                        assert.equal(surveyAnswerCount, 1);
                        assert.equal(contactListUserCount, 0);
                        done();
                      } catch (error) {
                        done(error);
                      }
                    });
                  });
              }, (error) => {
                done(error);
              });
            })
          });
        });
      });

      it('should succeed on answering with contact list', function (done) {
        let params = surveyParams();
        params.SurveyQuestions.push(surveyQuestionContactListConfirm());
        params.SurveyQuestions.push(surveyQuestionContactList());

        ContactListUser.count().then(function(c) {
          assert.equal(c, 1);

          surveyServices.createSurveyWithQuestions(params, testData.account).then(function(result) {
            let survey = result.data;

            SurveyQuestion.findAll().then(function(results) {
              let answerParams = surveyAnswerParams(results);
              answerParams.surveyId = survey.id;

              surveyServices.answerSurvey(answerParams).then(function(result) {
                SurveyAnswer.count().then(function(surveyAnswercCount) {
                  ContactListUser.count().then(function(contactListUserCount) {
                    try {
                      assert.equal(result.message, surveyServices.messages.completed);
                      assert.equal(surveyAnswercCount, 1);
                      assert.equal(contactListUserCount, 2);
                      done();
                    } catch (error) {
                      done(error);
                    }
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
        params.SurveyQuestions.push(surveyQuestionContactListConfirm());
        params.SurveyQuestions.push(surveyQuestionContactList());

        ContactListUser.count().then(function(c) {
          assert.equal(c, 1);

          surveyServices.createSurveyWithQuestions(params, testData.account).then(function(result) {
            let survey = result.data;

            SurveyQuestion.findAll().then(function(results) {
              let answerParams = surveyAnswerParams(results);
              answerParams.surveyId = survey.id;
              answerParams.SurveyQuestions[4].contactDetails.email = 'invalidEmail';

              surveyServices.answerSurvey(answerParams).then(function(result) {
                done('Should not get here!');
              }, function(error) {
                assert.deepEqual(error, { email: 'Email has invalid format' });
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

        surveyServices.createSurveyWithQuestions(params, testData.account).then(function(result) {
          let survey = result.data;

          surveyServices.confirmSurvey({ id: survey.id }, testData.account).then(function(result) {
            try {
              assert.isNotNull(result.data.confirmedAt);
              done();
            } catch (error) {
              done(error);
            }
          }, function(error) {
            done(error);
          });
        });
      });
    });

    describe('sad path', function() {
      it('should fail on finding survey', function (done) {
        let params = surveyParams();

        surveyServices.createSurveyWithQuestions(params, testData.account).then(function(result) {
          let survey = result.data;
          let date = new Date();

          surveyServices.confirmSurvey({ id: survey.id + 100, confirmedAt: date }, testData.account).then(function(result) {
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

        surveyServices.createSurveyWithQuestions(params, testData.account).then(function(result) {
          let survey = result.data;
          let answerParams = surveyAnswerParams(survey.SurveyQuestions);
          answerParams.surveyId = survey.id;

          surveyServices.answerSurvey(answerParams).then(function(result) {

              surveyServices.exportSurvey({ id: survey.id }, testData.account).then(function(result) {
                let validResult = {
                  header: [ 'Some default name 0', 'Some default name 1' ],
                  data: [{
                    'Some default name 0': '0 answer 0',
                    'Some default name 1': '0 answer 1'
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

        surveyServices.createSurveyWithQuestions(params, testData.account).then(function(result) {
          let survey = result.data;

          surveyServices.exportSurvey({ id: survey.id + 100 }, testData.account).then(function(result) {
            done('Should not get here!');
          }, function(error) {
            assert.equal(error, surveyServices.messages.notFound);
            done();
          });
        });
      });
    });
  });

  describe('#getSurveyStats', function() {
    describe('happy path', function() {
      it('should succeed', function (done) {
        let params = surveyParams();
        delete params.confirmedAt;

        surveyServices.createSurveyWithQuestions(params, testData.account).then(function(result) {
          let survey = result.data;
          let answerParams = surveyAnswerParams(survey.SurveyQuestions);
          answerParams.surveyId = survey.id;

          surveyServices.answerSurvey(answerParams).then(function(result) {
              surveyServices.getSurveyStats(survey.id, testData.account).then(function(result) {
                let validResult = { 
                  survey: { 
                    name: params.name, 
                    id: survey.id, 
                    answers: 1 
                  },
                  questions: { 
                    '1': { 
                      name: 'Some default name 0',
                      answers: { 
                        '0': { name: '0 answer 0', count: 1, percent: 100 }, 
                        '1': { name: '1 answer 0', count: 0, percent: 0 }, 
                        '2': { name: '2 answer 0', count: 0, percent: 0 }, 
                        '3': { name: '3 answer 0', count: 0, percent: 0 } 
                      } 
                    },
                    '2': { 
                      name: 'Some default name 1',
                      answers: { 
                        '0': { name: '0 answer 1', count: 1, percent: 100 }, 
                        '1': { name: '1 answer 1', count: 0, percent: 0 }, 
                        '2': { name: '2 answer 1', count: 0, percent: 0 }, 
                        '3': { name: '3 answer 1', count: 0, percent: 0 }
                      } 
                    } 
                  }
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
