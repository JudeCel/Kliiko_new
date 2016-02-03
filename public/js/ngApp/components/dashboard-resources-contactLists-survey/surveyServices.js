(function () {
  'use strict';
  angular.module('KliikoApp').factory('surveyServices', surveyServices);
  angular.module('KliikoApp.Root').factory('surveyServices', surveyServices);
  surveyServices.$inject = ['globalSettings', '$q', '$resource', 'dbg'];

  function surveyServices(globalSettings, $q, $resource, dbg) {
    var surveyRestApi = $resource(globalSettings.restUrl + '/survey/:path', null, {
      update: { method: 'PUT' },
      find: { method: 'GET', params: { path: 'find' } },
      status: { method: 'PUT', params: { path: 'status' } },
      copy: { method: 'POST', params: { path: 'copy' } },
      answer: { method: 'POST', params: { path: 'answer' } },
      confirm: { method: 'PUT', params: { path: 'confirm' } },
      constants: { method: 'GET', params: { path: 'constants' } }
    });

    var upServices = {};

    upServices.getConstants = getConstants;
    upServices.getAllSurveys = getAllSurveys;
    upServices.findSurvey = findSurvey;
    upServices.removeSurvey = removeSurvey;
    upServices.changeStatus = changeStatus;
    upServices.updateSurvey = updateSurvey;
    upServices.createSurvey = createSurvey;
    upServices.copySurvey = copySurvey;
    upServices.answerSurvey = answerSurvey;
    upServices.confirmSurvey = confirmSurvey;
    upServices.pickValidClass = pickValidClass;
    upServices.prepareError = prepareError;
    return upServices;

    function getConstants() {
      var deferred = $q.defer();

      dbg.log2('#surveyServices > getConstants > make rest call');
      surveyRestApi.constants({}, function(res) {
        dbg.log2('#surveyServices > getConstants > rest call responds');
        deferred.resolve(res);
      });

      return deferred.promise;
    };

    function getAllSurveys() {
      var deferred = $q.defer();

      dbg.log2('#surveyServices > getAllSurveys > make rest call');
      surveyRestApi.get({}, function(res) {
        dbg.log2('#surveyServices > getAllSurveys > rest call responds');
        deferred.resolve(res);
      });

      return deferred.promise;
    };

    function findSurvey(data) {
      var deferred = $q.defer();

      dbg.log2('#surveyServices > findSurvey > make rest call');
      surveyRestApi.find(data, function(res) {
        dbg.log2('#surveyServices > findSurvey > rest call responds');
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

    function answerSurvey(data) {
      var deferred = $q.defer();

      dbg.log2('#surveyServices > answerSurvey > make rest call');
      surveyRestApi.answer(data, function(res) {
        dbg.log2('#surveyServices > answerSurvey > rest call responds');
        deferred.resolve(res);
      });

      return deferred.promise;
    };

    function confirmSurvey(data) {
      var deferred = $q.defer();

      dbg.log2('#surveyServices > confirmSurvey > make rest call');
      surveyRestApi.confirm(data, function(res) {
        dbg.log2('#surveyServices > confirmSurvey > rest call responds');
        deferred.resolve(res);
      });

      return deferred.promise;
    };

    function pickValidClass(error, className) {
      return className + (error && Object.keys(error).length > 0 ? '-danger' : '-success');
    };

    function prepareError(errors) {
      if(typeof errors == 'string') {
        return errors;
      }
      else {
        var string = '';
        for(var i in errors) {
          var error = errors[i];
          string += (error + '<br>');
        }
        return string;
      }
    };
  };
})();
