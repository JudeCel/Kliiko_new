(function () {
  'use strict';

  angular.module('KliikoApp').factory('brandColourServices', brandColourServices);
  brandColourServices.$inject = ['$q', '$resource', 'dbg'];

  function brandColourServices($q, $resource, dbg) {
    var brandColorApi = $resource('/brandColour/:path', null, {
      update: { method: 'PUT' },
      reset: { method: 'PUT', params: { path: 'default' } },
      copy: { method: 'POST', params: { path: 'copy' } },
      canCreateCustomColors: { method: 'GET', params: { path: 'canCreateCustomColors' } },
    });

    var upServices = {};
    upServices.getAllSchemes = getAllSchemes;
    upServices.resetScheme = resetScheme;
    upServices.updateScheme = updateScheme;
    upServices.createScheme = createScheme;
    upServices.removeScheme = removeScheme;
    upServices.copyScheme = copyScheme;
    upServices.canCreateCustomColors = canCreateCustomColors;
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

    function canCreateCustomColors() {
      var deferred = $q.defer();

      dbg.log2('#brandColourServices > canCreateCustomColors > make rest call');
      brandColorApi.canCreateCustomColors({}, function(res) {
        dbg.log2('#brandColourServices > canCreateCustomColors > rest call responds');
        deferred.resolve(res);
      });

      return deferred.promise;
    }

    function resetScheme(data) {
      var deferred = $q.defer();

      dbg.log2('#brandColourServices > resetScheme > make rest call');
      brandColorApi.reset(data, function(res) {
        dbg.log2('#brandColourServices > resetScheme > rest call responds');
        deferred.resolve(res);
      });

      return deferred.promise;
    };

    function updateScheme(data) {
      var deferred = $q.defer();

      dbg.log2('#brandColourServices > updateScheme > make rest call');
      brandColorApi.update(data, function(res) {
        dbg.log2('#brandColourServices > updateScheme > rest call responds');
        deferred.resolve(res);
      });

      return deferred.promise;
    };

    function createScheme(data) {
      var deferred = $q.defer();

      dbg.log2('#brandColourServices > createScheme > make rest call');
      brandColorApi.save(data, function(res) {
        dbg.log2('#brandColourServices > createScheme > rest call responds');
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

      dbg.log2('#brandColourServices > copyScheme > make rest call');
      brandColorApi.copy(data, function(res) {
        dbg.log2('#brandColourServices > copyScheme > rest call responds');
        deferred.resolve(res);
      });

      return deferred.promise;
    };
  };
})();
