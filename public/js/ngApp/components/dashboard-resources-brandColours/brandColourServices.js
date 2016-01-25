(function () {
  'use strict';

  angular.module('KliikoApp').factory('brandColourServices', brandColourServices);
  brandColourServices.$inject = ['globalSettings', '$q', '$resource', 'dbg'];

  function brandColourServices(globalSettings, $q, $resource, dbg) {
    var brandColorApi = $resource(globalSettings.restUrl + '/brandColour/:path', null, {
      copy: { method: 'POST', params: { path: 'copy' } }
    });

    var upServices = {};
    upServices.getAllSchemes = getAllSchemes;
    upServices.removeScheme = removeScheme;
    upServices.copyScheme = copyScheme;
    upServices.prepareError = prepareError;
    return upServices;

    function getAllSchemes() {
      var deferred = $q.defer();

      dbg.log2('#brandColourServices > getAllSchemes > make rest call');
      brandColorApi.get({}, function(res) {
        dbg.log2('#brandColourServices > getAllSchemes > rest call responds');
        deferred.resolve(res);
      });

      return deferred.promise;
    };

    function removeScheme(data) {
      var deferred = $q.defer();

      dbg.log2('#brandColourServices > removeScheme > make rest call');
      brandColorApi.delete(data, function(res) {
        dbg.log2('#brandColourServices > removeScheme > rest call responds');
        deferred.resolve(res);
      });

      return deferred.promise;
    };

    function copyScheme(data) {
      var deferred = $q.defer();

      dbg.log2('#surveyServices > copyScheme > make rest call');
      brandColorApi.copy(data, function(res) {
        dbg.log2('#surveyServices > copyScheme > rest call responds');
        deferred.resolve(res);
      });

      return deferred.promise;
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
