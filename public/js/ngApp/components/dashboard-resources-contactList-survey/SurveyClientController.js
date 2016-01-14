(function () {
  'use strict';

  angular.module('KliikoApp.Root').controller('SurveyClientController', SurveyClientController);
  SurveyClientController.$inject = ['dbg', 'surveyServices', 'messenger', '$routeParams'];

  function SurveyClientController(dbg, surveyServices, messenger, $routeParams) {
    dbg.log2('#SurveyClientController started');

    var vm = this;
    vm.manage = { survey: { SurveyQuestions: [] } };

    vm.listQuestions = listQuestions;
    vm.pickValidClass = pickValidClass;
    vm.submitSurvey = submitSurvey;
    vm.onChange = onChange;
    vm.init = init;

    function init(surveyId) {
      surveyServices.findSurvey({ id: surveyId }).then(function(res) {
        dbg.log2('#SurveyClientController > findSurvey > res ', res);
        if(res.error) {
          vm.message = res.error;
        }
        else {
          vm.manage.survey = res.data;
        }
      });
    };

    function submitSurvey() {
      if(validateAnswers()) {
        vm.surveySelect.error = 'There are some unfilled questions.';
      }
      else {
        delete vm.surveySelect.error;
        vm.surveySelect.surveyId = vm.manage.survey.id;

        surveyServices.answerSurvey(vm.surveySelect).then(function(res) {
          dbg.log2('#SurveyClientController > answerSurvey > res ', res);

          if(res.error) {
            messenger.error(res.error);
          }
          else {
            vm.message = res.data;
          }
        });
      }
    }

    function listQuestions() {
      return vm.manage.survey.SurveyQuestions;
    };

    function validateAnswers() {
      var questions = vm.surveySelect.SurveyQuestions;
      var errors = 0;

      for(var i in questions) {
        var question = questions[i];
        if(!question.hasOwnProperty("answer")) {
          question.error = 'Please fill this answer!';
          errors++;
        }
        else {
          delete question.error;
        }
      }

      return (errors > 0);
    };

    function pickValidClass(error, className) {
      return className + (error ? '-danger' : '-success');
    };

    function onChange(question) {
      if(question.error) {
        delete question.error;
      }
    }
  };
})();
