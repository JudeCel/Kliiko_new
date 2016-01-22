(function () {
  'use strict';
  angular.module('KliikoApp').factory('GalleryServices', GalleryServices);
  GalleryServices.$inject = ['globalSettings', '$q', '$resource', 'dbg', 'Upload'];

  function GalleryServices(globalSettings, $q, $resource, dbg, Upload) {
    var galleryRestApi = {
      gallery: $resource(globalSettings.restUrl +'/gallery', {}, { post: { method: 'POST' } }),
      uploadFile: $resource(globalSettings.restUrl +'/gallery/uploadFile', {}, { post: { method: 'POST' } }),
      saveYoutubeUrl: $resource(globalSettings.restUrl +'/gallery/saveYoutubeUrl', {}, { post: { method: 'POST' } }),
      download: $resource(globalSettings.restUrl +'/gallery/download')
    };

    var upServices = {};

    upServices.getResources = getResources;
    upServices.downloadResources = downloadResources;
    upServices.deleteResources = deleteResources;
    upServices.createResource = createResource;
    upServices.saveYoutubeUrl = saveYoutubeUrl;
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

    function createResource(params) {
      var deferred = $q.defer();

      dbg.log2('#GalleryServices > createGalleryResources > make rest call');
      galleryRestApi.gallery.post(params, function(res) {
        dbg.log2('#GalleryServices > createGalleryResources > rest call responds');
        deferred.resolve(res);
      });

      return deferred.promise;
    }

    function saveYoutubeUrl(params) {
      var deferred = $q.defer();

      dbg.log2('#GalleryServices > saveYoutubeUrlResources > make rest call');
      galleryRestApi.saveYoutubeUrl.post(params, function(res) {
        dbg.log2('#GalleryServices > saveYoutubeUrlResources > rest call responds');
        deferred.resolve(res);
      });

      return deferred.promise;
    }

  };
})();
