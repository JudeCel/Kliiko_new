(function () {
  'use strict';
  angular.module('KliikoApp').factory('GalleryServices', GalleryServices);
  GalleryServices.$inject = ['globalSettings', '$q', '$resource', 'dbg', 'Upload'];

  function GalleryServices(globalSettings, $q, $resource, dbg, Upload) {
    var galleryRestApi = {
      gallery: $resource(globalSettings.restUrl +'/gallery', {}, { post: { method: 'POST' } }),
      download: $resource(globalSettings.restUrl +'/gallery/download'),
      validate: $resource(globalSettings.restUrl +'/gallery/validate')
    };

    var upServices = {};

    upServices.getResources = getResources;
    upServices.downloadResources = downloadResources;
    upServices.deleteResources = deleteResources;
    upServices.uploadResource = uploadResource;
    upServices.validateData = validateData;
    return upServices;

    function getResources() {
      var deferred = $q.defer();

      dbg.log2('#GalleryServices > getResources > make rest call');
      galleryRestApi.gallery.get({}, function(res) {
        dbg.log2('#GalleryServices > getResources > rest call responds');
        deferred.resolve(res);
      });

      return deferred.promise;
    };

    function downloadResources(ids) {
      var deferred = $q.defer();
      
      dbg.log2('#GalleryServices > downloadGalleryResources > make rest call');
      galleryRestApi.download.get(ids, function(res) {
        dbg.log2('#GalleryServices > downloadGalleryResources > rest call responds');
        deferred.resolve(res);
      });

      return deferred.promise;
    };

    function deleteResources(ids) {
      var deferred = $q.defer();

      dbg.log2('#GalleryServices > deleteGalleryResources > make rest call');
      galleryRestApi.gallery.delete(ids, function(res) {
        dbg.log2('#GalleryServices > deleteGalleryResources > rest call responds');
        deferred.resolve(res);
      });

      return deferred.promise;
    };

    function uploadResource(params) {
      //TODO
    };

    function validateData(data){
      var deferred = $q.defer();
      
      dbg.log2('#GalleryServices > validatesGalleryResources > make rest call');
      galleryRestApi.validate.get(data, function(res) {
        dbg.log2('#GalleryServices > validatesGalleryResources > rest call responds');
        deferred.resolve(res);
      });

      return deferred.promise;
    }

  };
})();
