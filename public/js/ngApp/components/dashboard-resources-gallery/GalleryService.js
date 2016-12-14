(function () {
  'use strict';
  angular.module('KliikoApp').factory('GalleryServices', GalleryServices);
  angular.module('KliikoApp.Root').factory('GalleryServices', GalleryServices);

  GalleryServices.$inject = ['$q', 'fileUploader'];
  function GalleryServices($q, fileUploader) {
    var upServices = {};

    upServices.listResources = listResources;
    upServices.createOrReplaceResource = createOrReplaceResource;
    upServices.removeResources = removeResources;
    upServices.zipResources = zipResources;
    upServices.refreshResource = refreshResource;
    upServices.surveyResources = surveyResources;
    upServices.closedSessionResourcesRemoveCheck = closedSessionResourcesRemoveCheck;
    upServices.prepareVideoServiceUrl = prepareVideoServiceUrl;

    return upServices;

    function prepareVideoServiceUrl(id, source) {
      switch (source) {
        case "youtube":
          return 'https://www.youtube.com/watch?v=' + id;
        case "vimeo":
          return 'https://vimeo.com/' + id;
        default:
          return null;
      }
    }

    function listResources(params) {
      var deferred = $q.defer();

      fileUploader.list(params).then(function(result) {
        deferred.resolve(result);
      }, function(error) {
        deferred.reject(error);
      });

      return deferred.promise;
    }

    function createOrReplaceResource(params) {
      var deferred = $q.defer();

      fileUploader.upload(params).then(function(result) {
        deferred.resolve(result);
      }, function(error) {
        deferred.reject(error);
      });

      return deferred.promise;
    }

    function removeResources(resourceIds) {
      var deferred = $q.defer();

      fileUploader.remove(resourceIds).then(function(result) {
        deferred.resolve(result);
      }, function(error) {
        deferred.reject(error);
      });

      return deferred.promise;
    }

    function closedSessionResourcesRemoveCheck(resourceIds) {
      var deferred = $q.defer();

      fileUploader.closedSessionResourcesRemoveCheck(resourceIds).then(function(result) {
        deferred.resolve(result);
      }, function(error) {
        deferred.reject(error);
      });

      return deferred.promise;
    }

    function zipResources(resourceIds, name) {
      var deferred = $q.defer();

      fileUploader.zip(resourceIds, name).then(function(result) {
        deferred.resolve(result);
      }, function(error) {
        deferred.reject(error);
      });

      return deferred.promise;
    }

    function refreshResource(resourceId) {
      var deferred = $q.defer();

      fileUploader.refresh(resourceId).then(function(result) {
        deferred.resolve(result);
      }, function(error) {
        deferred.reject(error);
      });

      return deferred.promise;
    }

    function surveyResources(surveyId) {
      var deferred = $q.defer();

      fileUploader.survey(surveyId).then(function(result) {
        deferred.resolve(result);
      }, function(error) {
        deferred.reject(error);
      });

      return deferred.promise;
    }
  };
})();
