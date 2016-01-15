(function () {
  'use strict';

  angular.module('KliikoApp.Root').controller('SurveyClientController', SurveyClientController);
  SurveyClientController.$inject = ['dbg', 'surveyServices', 'messenger', '$timeout'];

  function SurveyClientController(dbg, surveyServices, messenger, $timeout) {
    dbg.log2('#SurveyClientController started');

    var vm = this;
    vm.manage = { survey: { SurveyQuestions: [] } };
    vm.minsMaxs = {
      input: {
        min: 1,
        max: 20
      },
      textarea: {
        min: 1,
        max: 500
      }
    }
    vm.validationErrors = [
      {
        type: 'required',
        message: 'Please fill this answer!',
      },
      {
        type: 'minlength',
        message: 'Answer is too short!',
      },
      {
        type: 'maxlength',
        message: 'Answer is too long!',
      }
    ];

    vm.listQuestions = listQuestions;
    vm.pickValidClass = pickValidClass;
    vm.submitSurvey = submitSurvey;
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
      vm.submitedSurvey = true;
      $timeout(function() {
        if(vm.submitForm.$valid) {
          delete vm.surveySelect.error;
          vm.surveySelect.surveyId = vm.manage.survey.id;

          surveyServices.answerSurvey(vm.surveySelect).then(function(res) {
            dbg.log2('#SurveyClientController > answerSurvey > res ', res);

            console.log(res);
            if(res.error) {
              messenger.error(res.error);
            }
            else {
              vm.message = res.data;
            }
          });
        }
        else {
          vm.surveySelect.error = 'There are some unfilled answers!';
        }
      }, 1000);
    };

    function listQuestions() {
      return vm.manage.survey.SurveyQuestions;
    };

    function pickValidClass(error, className) {
      return className + (error && Object.keys(error).length > 0 ? '-danger' : '-success');
    };
  };
})();
