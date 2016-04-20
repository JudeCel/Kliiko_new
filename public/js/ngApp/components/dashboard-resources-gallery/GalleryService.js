(function () {
  'use strict';
  angular.module('KliikoApp').factory('GalleryServices', GalleryServices);

  GalleryServices.$inject = ['$q', 'fileUploader'];
  function GalleryServices($q, fileUploader) {
    var upServices = {};

    upServices.listResources = listResources;
    upServices.createResource = createResource;
    upServices.removeResources = removeResources;

    return upServices;

    function listResources() {
      var deferred = $q.defer();

      fileUploader.list().then(function(result) {
        deferred.resolve(result);
      }, function(error) {
        deferred.resolve(error);
      });

      return deferred.promise;
    }

    function createResource(params) {
      var deferred = $q.defer();

      fileUploader.upload(params).then(function(result) {
        deferred.resolve(result);
      }, function(error) {
        deferred.resolve(error);
      });

      return deferred.promise;
    }

    function removeResources(resourceIds) {
      var deferred = $q.defer();

      fileUploader.remove(resourceIds).then(function(result) {
        deferred.resolve(result);
      }, function(error) {
        deferred.resolve(error);
      });

      return deferred.promise;
    }
  };
})();
