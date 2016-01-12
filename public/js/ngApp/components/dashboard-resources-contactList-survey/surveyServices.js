(function () {
  'use strict';
  angular.module('KliikoApp').factory('surveyServices', surveyServices);
  surveyServices.$inject = ['globalSettings', '$q', '$resource', 'dbg'];

  function surveyServices(globalSettings, $q, $resource, dbg) {
    var surveyRestApi = {
      survey: $resource(globalSettings.restUrl + '/survey', null, { update: { method: 'PUT' } }),
      copySurvey: $resource(globalSettings.restUrl + '/survey/copy', null, { copy: { method: 'PUT' } })
    };

    var upServices = {};

    upServices.getAllSurveys = getAllSurveys;
    upServices.removeSurvey = removeSurvey;
    upServices.updateSurvey = updateSurvey;
    upServices.createSurvey = createSurvey;
    upServices.copySurvey = copySurvey;
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

    function updateSurvey(data) {
      var deferred = $q.defer();

      dbg.log2('#surveyServices > updateSurvey > make rest call');
      surveyRestApi.survey.update(data, function(res) {
        dbg.log2('#surveyServices > updateSurvey > rest call responds');
        deferred.resolve(res);
      });

      return deferred.promise;
    };

    function createSurvey(data) {
      var deferred = $q.defer();

      dbg.log2('#surveyServices > createSurvey > make rest call');
      surveyRestApi.survey.save(data, function(res) {
        dbg.log2('#surveyServices > createSurvey > rest call responds');
        deferred.resolve(res);
      });

      return deferred.promise;
    };

    function copySurvey(data) {
      var deferred = $q.defer();

      dbg.log2('#surveyServices > copySurvey > make rest call');
      surveyRestApi.copySurvey.copy(data, function(res) {
        dbg.log2('#surveyServices > copySurvey > rest call responds');
        deferred.resolve(res);
      });

      return deferred.promise;
    };
  };
})();
