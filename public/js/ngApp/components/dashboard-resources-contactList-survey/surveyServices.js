(function () {
  'use strict';
  angular.module('KliikoApp').factory('surveyServices', surveyServices);
  surveyServices.$inject = ['globalSettings', '$q', '$resource', 'dbg'];

  function surveyServices(globalSettings, $q, $resource, dbg) {
    var surveyRestApi = {
      survey: $resource(globalSettings.restUrl + '/survey')
    };

    var upServices = {};

    upServices.getAllSurveys = getAllSurveys;
    return upServices;

    function getAllSurveys() {
      var deferred = $q.defer();

      dbg.log2('#surveyServices > getAllSurveys > make rest call');
      surveyRestApi.survey.get({}, function(res) {
        dbg.log2('#surveyServices > getAllSurveys > rest call responds');
        deferred.resolve(res);
      });

      return deferred.promise;
    };
  };
})();
