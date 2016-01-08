(function () {
  'use strict';

  angular.module('KliikoApp').controller('SurveyController', SurveyController);
  SurveyController.$inject = ['dbg', 'surveyServices', 'angularConfirm', 'messenger', '$scope'];

  function SurveyController(dbg, surveyServices, angularConfirm, messenger, $scope) {
    dbg.log2('#SurveyController started');

    var vm = this;
    vm.surveys = {};

    vm.removeSurvey = removeSurvey;
    vm.changeStatus = changeStatus;
    vm.statusIcon = statusIcon;
    vm.chooseValidIcon = chooseValidIcon;
    vm.validateQuestion = validateQuestion;
    vm.questionChange = questionChange;
    vm.submitCreate = submitCreate;
    vm.initQuestion = initQuestion;
    vm.canChangeAnswers = canChangeAnswers;
    vm.changeAnswers = changeAnswers;
    vm.defaultArray = defaultArray;

    vm.answerSortOptions = {
      onSort: function(evt) {
        console.log(evt);
        evt.models.forEach(function(val, index, array) {
          val.order = index;
        });
      }
    }

    vm.createTemp = { survey: { SurveyQuestions: {} } };
    vm.create = { survey: { SurveyQuestions: [] } };
    vm.currentPage = 'create';
    vm.answers = Array.apply(null, Array(5)).map(function(cv, index) { return index });

    vm.defaultQuestions = [
      {
        order: 0,
        name: 'First Choice',
        input: true,
        minAnswers: 2,
        maxAnswers: 5
      },
      {
        order: 1,
        name: 'Second Choice',
        input: true,
        minAnswers: 2,
        maxAnswers: 5
      },
      {
        order: 2,
        name: 'Advice',
        textArea: true,
        minAnswers: 1,
        maxAnswers: 1
      },
      {
        order: 3,
        name: 'Like-Dislike',
        input: true,
        audioVideo: true,
        minAnswers: 2,
        maxAnswers: 5
      },
      {
        order: 4,
        name: 'Importance',
        input: true,
        audioVideo: true,
        minAnswers: 2,
        maxAnswers: 5
      },
      {
        order: 5,
        name: 'Most Important',
        input: true,
        minAnswers: 2,
        maxAnswers: 5
      },
      {
        order: 6,
        name: 'Interest',
        hardcodedName: true,
        checkbox: true,
        minAnswers: 1,
        maxAnswers: 1
      },
      {
        order: 7,
        name: 'Prize Draw',
        hardcodedName: true,
        checkbox: true,
        minAnswers: 1,
        maxAnswers: 1
      }
    ];

    init();

    function init() {
      surveyServices.getAllSurveys().then(function(res) {
        vm.surveys = res.data;
        dbg.log2('#SurveyController > getAllSurveys > res ', res.data);
      });
    };

    function removeSurvey(survey) {
      angularConfirm('Are you sure you want to remove Survey?').then(function(response) {
        surveyServices.removeSurvey({ id: survey.id }).then(function(res) {
          dbg.log2('#SurveyController > removeSurvey > res ', res);
          if(res.error) {
            messenger.error(res.error);
          }
          else {
            messenger.ok(res.data);
            var index = vm.surveys.indexOf(survey);
            vm.surveys.splice(index, 1);
          }
        });
      });
    };

    function changeStatus(survey) {
      surveyServices.changeStatus({ id: survey.id, closed: !survey.closed }).then(function(res) {
        dbg.log2('#SurveyController > changeStatus > res ', res);
        if(res.error) {
          messenger.error(res.error);
        }
        else {
          survey.closed = !survey.closed;
          messenger.ok("Survey has been successfully " + (survey.closed ? 'closed' : 'opened'));
        }
      });
    };

    function statusIcon(survey) {
      if(survey.closed) {
        return '/icons/password_red.png';
      }
      else {
        return '/icons/password_grey.png';
      }
    };

    function chooseValidIcon(status) {
      if(status) {
        return '/icons/ic_tick.png';
      }
      else {
        return '/icons/ic_cross.png';
      }
    };

    function validateSurvey() {
      var survey = vm.createTemp.survey;
      if(!survey.errors) {
        survey.errors = {};
      }

      if(survey.name.length == 0) {
        survey.errors.name = 'Too short';
      }
      else {
        delete survey.errors.name;
        vm.create.survey.name = survey.name;
      }

      if(survey.description.length == 0) {
        survey.errors.description = 'Too short';
      }
      else {
        delete survey.errors.description;
        vm.create.survey.description = survey.description;
      }

      if(Object.keys(vm.create.survey.SurveyQuestions).length < 2) {
        survey.errors.submitError = 'Not enougth questions';
      }
      else {
        delete survey.errors.submitError;
      }

      return (Object.keys(survey.errors).length == 0);
    }

    function validateQuestion(order, sq) {
      if(!sq.errors) {
        sq.errors = {};
      }

      if(sq.active) {
        changeCreateObject(order, false, sq);
      }
      else {
        if(sq.name.length == 0) {
          sq.errors.name = 'Too short';
        }
        else {
          delete sq.errors.name;
        }

        if(sq.question.length == 0) {
          sq.errors.question = 'Too short';
        }
        else {
          delete sq.errors.question;
        }

        var answers = Object.keys(sq.answers).length;
        if(answers < sq.minAnswers) {
          sq.errors.answer = 'Not enougth answers';
        }
        else if(answers > sq.maxAnswers){
          sq.errors.answer = 'Too many answers';
        }
        else {
          delete sq.errors.answer;
          sq.errors.answers = {};
          for(var key in sq.answers) {
            var answer = sq.answers[key];
            if(answer.name.length == 0 || answer.name.length > 20) {
              sq.errors.answers[key] = 'Too short/long';
            }
          };
          if(Object.keys(sq.errors.answers).length == 0) {
            delete sq.errors.answers;
          }
        }

        if(Object.keys(sq.errors).length == 0) {
          changeCreateObject(order, true, sq);
        }
      }
    };

    function changeCreateObject(order, status, sq) {
      if(status) {
        sq.order = order;
        vm.create.survey.SurveyQuestions.push(sq);
        sq.active = status;
      }
      else {
        sq.active = status;
        var index = vm.create.survey.SurveyQuestions.indexOf(sq);
        vm.create.survey.SurveyQuestions.splice(index, 1);
      }
    };

    function questionChange(order, currentQuestion) {
      if(currentQuestion.active) {
        changeCreateObject(order, false, currentQuestion);
      }
    };

    function submitCreate() {
      if(validateSurvey()) {
        surveyServices.createSurvey(vm.create.survey).then(function(res) {
          dbg.log2('#SurveyController > submitCreate > res ', res);
          console.log(res);
          if(res.error) {
            messenger.error(res.error);
          }
          else {
            messenger.ok(res.data.message);
          }
        });
      }
      else {
        if(!vm.createTemp.survey.errors.submitError) {
          vm.createTemp.survey.errors.submitError = 'There were some errors';
        }
      }
    };

    function initQuestion(object) {
      if(!vm.createTemp.survey.SurveyQuestions[object.order]) {
        vm.createTemp.survey.SurveyQuestions[object.order] = {};
      }

      var question = vm.createTemp.survey.SurveyQuestions[object.order];
      question.minAnswers = object.minAnswers;
      question.maxAnswers = object.maxAnswers;
      if(object.hardcodedName) {
        question.name = object.name;
      }

      return question;
    };

    function canChangeAnswers(value, question) {
      if(value > 0) {
        return (question.answers.length < question.maxAnswers);
      }
      else {
        return (question.answers.length > question.minAnswers);
      }
    };

    function changeAnswers(value, question, index) {
      changeCreateObject(question.order, false, question);
      if(value > 0) {
        console.log(question);
        question.answers.push({ order: question.answers.length });
      }
      else {
        question.answers.splice(index, 1);
      }
    };

    function defaultArray(size) {
      return Array.apply(null, Array(size)).map(function(cv, index) { return { order: index } });
    }
  };
})();
