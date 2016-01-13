(function () {
  'use strict';
  angular.module('KliikoApp').factory('surveyServices', surveyServices);
  surveyServices.$inject = ['globalSettings', '$q', '$resource', 'dbg'];

  function surveyServices(globalSettings, $q, $resource, dbg) {
    var surveyRestApi = $resource(globalSettings.restUrl + '/survey/:path', null, {
      update: { method: 'PUT' },
      status: { method: 'PUT', params: { path: 'status' } },
      copy: { method: 'PUT', params: { path: 'copy' } }
    });

    var upServices = {};

    upServices.getAllSurveys = getAllSurveys;
    upServices.removeSurvey = removeSurvey;
    upServices.changeStatus = changeStatus;
    upServices.updateSurvey = updateSurvey;
    upServices.createSurvey = createSurvey;
    upServices.copySurvey = copySurvey;
    return upServices;

    function getAllSurveys() {
      var deferred = $q.defer();

      dbg.log2('#surveyServices > getAllSurveys > make rest call');
      surveyRestApi.get({}, function(res) {
        dbg.log2('#surveyServices > getAllSurveys > rest call responds');
        deferred.resolve(res);
      });

      return deferred.promise;
    };

    function removeSurvey(data) {
      var deferred = $q.defer();

      dbg.log2('#surveyServices > removeSurvey > make rest call');
      surveyRestApi.delete(data, function(res) {
        dbg.log2('#surveyServices > removeSurvey > rest call responds');
        deferred.resolve(res);
      });

      return deferred.promise;
    };

    function changeStatus(data) {
      var deferred = $q.defer();

      dbg.log2('#surveyServices > changeStatus > make rest call');
      surveyRestApi.status(data, function(res) {
        dbg.log2('#surveyServices > changeStatus > rest call responds');
        deferred.resolve(res);
      });

      return deferred.promise;
    };

    function updateSurvey(data) {
      var deferred = $q.defer();

      dbg.log2('#surveyServices > updateSurvey > make rest call');
      surveyRestApi.update(data, function(res) {
        dbg.log2('#surveyServices > updateSurvey > rest call responds');
        deferred.resolve(res);
      });

      return deferred.promise;
    };

    function createSurvey(data) {
      var deferred = $q.defer();

      dbg.log2('#surveyServices > createSurvey > make rest call');
      surveyRestApi.save(data, function(res) {
        dbg.log2('#surveyServices > createSurvey > rest call responds');
        deferred.resolve(res);
      });

      return deferred.promise;
    };

    function copySurvey(data) {
      var deferred = $q.defer();

      dbg.log2('#surveyServices > copySurvey > make rest call');
      surveyRestApi.copy(data, function(res) {
        dbg.log2('#surveyServices > copySurvey > rest call responds');
        deferred.resolve(res);
      });

      return deferred.promise;
    };
  };
})();
