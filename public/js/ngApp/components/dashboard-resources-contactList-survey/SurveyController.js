(function () {
  'use strict';

  angular.module('KliikoApp').controller('SurveyController', SurveyController);
  SurveyController.$inject = ['dbg', 'surveyServices', '$modal', '$scope', '$rootScope', '$filter', '$timeout', 'angularConfirm'];

  function SurveyController(dbg, surveyServices, $modal, $scope, $rootScope, $filter, $timeout, angularConfirm) {
    dbg.log2('#SurveyController started');

    var vm = this;
    vm.surveys = {};

    init();

    function init() {
      surveyServices.getAllSurveys().then(function(res) {
        $scope.surveys = res.surveys;
        dbg.log2('#SurveyController > getAllSurveys > res ', res.surveys);
      });
    };

    function setMessage(scope, message) {
      if(message) {
        scope.error = null;
      }

      scope.message = message;
    };

    function setError(scope, error) {
      if(error) {
        scope.message = null;
      }

      scope.error = error;
    };

    $scope.$watch('message', function(data) {
      if(vm.message) {
        $timeout(function() {
          setMessage(vm, null);
        }, 2000);
      }
    });

    $scope.$watch('error', function(data) {
      if(vm.error) {
        $timeout(function() {
          setError(vm, null);
        }, 2000);
      }
    });
  };
})();
