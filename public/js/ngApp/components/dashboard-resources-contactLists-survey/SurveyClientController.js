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
  SurveyClientController.$inject = ['dbg', 'surveyServices', 'messenger', '$timeout', '$sce'];

  function SurveyClientController(dbg, surveyServices, messenger, $timeout, $sce) {
    dbg.log2('#SurveyClientController started');

    var vm = this;
    vm.survey = { SurveyQuestions: {} };

    vm.pickValidClass = surveyServices.pickValidClass;
    vm.submitSurvey = submitSurvey;
    vm.init = init;
    vm.getResourceNameUrl = getResourceNameUrl;
    vm.getResourceThumbUrl = getResourceThumbUrl;
    vm.renderHtml = renderHtml;

    initConstants();

    function initConstants() {
      surveyServices.getConstants().then(function(res) {
        vm.unfilled = res.data.validationErrors.unfilled;
        vm.validationErrors = res.data.validationErrors.answer;
        vm.minsMaxs = res.data.minsMaxs;
      });
    };

    function init(surveyId) {
      surveyServices.findSurvey({ id: surveyId }).then(function(res) {
        dbg.log2('#SurveyClientController > findSurvey > res ', res);

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
      }, 1000);
    };

    function getResourceNameUrl(resource){
      return "/chat_room/uploads/" + resource.JSON.name;
    }

    function getResourceThumbUrl(resource){
      return "/chat_room/uploads/" + resource.JSON.panelThumb;
    }

    function renderHtml(resource) {
      return $sce.trustAsHtml(resource.JSON.message);
    };

  };
})();
