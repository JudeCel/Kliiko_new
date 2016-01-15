(function () {
  'use strict';

  angular.module('KliikoApp.Root').controller('SurveyClientController', SurveyClientController);
  SurveyClientController.$inject = ['dbg', 'surveyServices', 'messenger', '$timeout', 'ngProgressFactory'];

  function SurveyClientController(dbg, surveyServices, messenger, $timeout, ngProgressFactory) {
    dbg.log2('#SurveyClientController started');

    var vm = this;
    vm.survey = { SurveyQuestions: {} };
    vm.minsMaxs = {
      input: {
        min: 1,
        max: 20
      },
      textarea: {
        min: 1,
        max: 500
      }
    };

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

    vm.pickValidClass = pickValidClass;
    vm.submitSurvey = submitSurvey;
    vm.init = init;

    function init(surveyId) {
      var progressbar = ngProgressFactory.createInstance();
      progressbar.start();

      surveyServices.findSurvey({ id: surveyId }).then(function(res) {
        dbg.log2('#SurveyClientController > findSurvey > res ', res);
        progressbar.complete();

        if(res.error) {
          vm.message = res.error;
        }
        else {
          vm.survey = res.data;
        }
      });
    };

    function submitSurvey() {
      vm.submitedSurvey = true;
      vm.submitingSurvey = true;
      var progressbar = ngProgressFactory.createInstance();
      progressbar.start();

      $timeout(function() {
        if(vm.submitForm.$valid) {
          delete vm.surveySelect.error;
          vm.surveySelect.surveyId = vm.survey.id;

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
        else {
          vm.surveySelect.error = 'There are some unfilled answers!';
        }

        vm.submitingSurvey = false;
        progressbar.complete();
      }, 1000);
    };

    function pickValidClass(error, className) {
      return className + (error && Object.keys(error).length > 0 ? '-danger' : '-success');
    };
  };
})();
