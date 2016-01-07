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

    vm.createTemp = { survey: { SurveyQuestions: {} } };
    vm.create = { survey: { SurveyQuestions: {} } };
    vm.currentPage = 'create';
    vm.answers = Array.apply(null, Array(2)).map(function(cv, index) { return index });

    vm.defaultQuestions = [
      {
        order: 0,
        name: 'First Choice',
        input: true
      },
      {
        order: 1,
        name: 'Second Choice',
        input: true
      },
      {
        order: 2,
        name: 'Advice',
        textArea: true
      },
      {
        order: 3,
        name: 'Like-Dislike',
        input: true,
        audioVideo: true
      },
      {
        order: 4,
        name: 'Importance',
        input: true,
        audioVideo: true
      },
      {
        order: 5,
        name: 'Most Important',
        input: true
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

    function validateSurvey(error) {
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

        if(Object.keys(sq.answers).length < 2) {
          sq.errors.answer = 'Not enougth answers';
        }
        else {
          delete sq.errors.answer;
          sq.errors.answers = {};
          for(var key in sq.answers) {
            var answer = sq.answers[key];
            if(answer.length == 0 || answer.length > 20) {
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
        var object = {};
        object[order] = sq;
        angular.merge(vm.create.survey.SurveyQuestions, object);
        sq.active = status;
      }
      else {
        sq.active = status;
        delete vm.create.survey.SurveyQuestions[order];
      }
    }

    function questionChange(order, currentQuestion) {
      if(currentQuestion.active) {
        changeCreateObject(order, false, currentQuestion);
      }
    }

    function submitCreate() {
      var error = {};
      if(validateSurvey(error)) {
        console.log("Wiiiiiiiiiiii it works");
      }
      else {
        if(!vm.createTemp.survey.errors.submitError) {
          vm.createTemp.survey.errors.submitError = 'There were some errors';
        }
      }
    }
  };
})();
