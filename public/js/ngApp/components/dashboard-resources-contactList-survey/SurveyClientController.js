(function () {
  'use strict';

  angular.module('KliikoApp').filter('toArray', filter);
  angular.module('KliikoApp.Root').filter('toArray', filter);

  function filter() {
    return function(obj) {
      var result = [];
      angular.forEach(obj, function(val, key) {
        result[val.order] = val;
      });
      return result;
    };
  }

  angular.module('KliikoApp.Root').controller('SurveyClientController', SurveyClientController);
  SurveyClientController.$inject = ['dbg', 'surveyServices', 'messenger', '$timeout', 'ngProgressFactory'];

  function SurveyClientController(dbg, surveyServices, messenger, $timeout, ngProgressFactory) {
    dbg.log2('#SurveyClientController started');

    var vm = this;
    vm.survey = { SurveyQuestions: {} };

    vm.pickValidClass = surveyServices.pickValidClass;
    vm.submitSurvey = submitSurvey;
    vm.init = init;

    initConstants();

    function initConstants() {
      surveyServices.getConstants().then(function(res) {
        vm.unfilled = res.data.validationErrors.unfilled;
        vm.validationErrors = res.data.validationErrors.answer;
        vm.minsMaxs = res.data.minsMaxs;
      });
    };

    function init(surveyId) {
      var progressbar = ngProgressFactory.createInstance();
      progressbar.start();

      surveyServices.findSurvey({ id: surveyId }).then(function(res) {
        dbg.log2('#SurveyClientController > findSurvey > res ', res);
        progressbar.complete();

        if(res.error) {
          vm.message = surveyServices.prepareError(res.error);
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
              messenger.error(surveyServices.prepareError(res.error));
            }
            else {
              vm.message = res.message;
            }
          });
        }
        else {
          vm.surveySelect.error = vm.unfilled;
        }

        vm.submitingSurvey = false;
        progressbar.complete();
      }, 1000);
    };
  };
})();
