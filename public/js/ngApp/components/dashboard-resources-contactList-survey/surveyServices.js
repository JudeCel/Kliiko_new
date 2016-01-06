(function () {
  'use strict';
  angular.module('KliikoApp').factory('surveyServices', surveyServices);
  surveyServices.$inject = ['globalSettings', '$q', '$resource', 'dbg'];

  function surveyServices(globalSettings, $q, $resource, dbg) {
    var surveyRestApi = {
      survey: $resource(globalSettings.restUrl + '/survey', null, { update: { method: 'PUT' } })
    };

    var upServices = {};

    upServices.getAllSurveys = getAllSurveys;
    upServices.removeSurvey = removeSurvey;
    upServices.changeStatus = changeStatus;
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

    function removeSurvey(data) {
      var deferred = $q.defer();

      dbg.log2('#surveyServices > removeSurvey > make rest call');
      surveyRestApi.survey.delete(data, function(res) {
        dbg.log2('#surveyServices > removeSurvey > rest call responds');
        deferred.resolve(res);
      });

      return deferred.promise;
    };

    function changeStatus(data) {
      var deferred = $q.defer();

      dbg.log2('#surveyServices > changeStatus > make rest call');
      surveyRestApi.survey.update(data, function(res) {
        dbg.log2('#surveyServices > changeStatus > rest call responds');
        deferred.resolve(res);
      });

      return deferred.promise;
    };
  };
})();
