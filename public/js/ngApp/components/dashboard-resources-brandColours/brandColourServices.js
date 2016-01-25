(function () {
  'use strict';

  angular.module('KliikoApp').factory('brandColourService', brandColourService);
  brandColourService.$inject = ['globalSettings', '$q', '$resource', 'dbg'];

  function brandColourService(globalSettings, $q, $resource, dbg) {
    var brandColorApi = $resource(globalSettings.restUrl + '/brandColor/:path', null, {});

    var upServices = {};
    upServices.getAllSchemas = getAllSchemas;
    return upServices;

    function getAllSchemas() {
      var deferred = $q.defer();

      dbg.log2('#brandColourService > getAllSchemas > make rest call');
      brandColorApi.get({}, function(res) {
        dbg.log2('#brandColourService > getAllSchemas > rest call responds');
        deferred.resolve(res);
      });

      return deferred.promise;
    };
  };
})();
