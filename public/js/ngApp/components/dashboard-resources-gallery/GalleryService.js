(function () {
  'use strict';
  angular.module('KliikoApp').factory('GalleryServices', GalleryServices);
  GalleryServices.$inject = ['globalSettings', '$q', '$resource', 'dbg', 'Upload'];

  function GalleryServices(globalSettings, $q, $resource, dbg, Upload) {
    var galleryRestApi = $resource(globalSettings.restUrl + '/gallery/:path', null, {
      uploadFile: { method: 'POST', params: { path: 'uploadFile' } },
      saveYoutubeUrl: { method: 'POST', params: { path: 'saveYoutubeUrl' } },
      deleteZipFile: { method: 'POST', params: { path: 'deleteZipFile' } },
      download: { method: 'GET', params: { path: 'download' } },
      zip: { method: 'DELETE', params: { path: 'zip' } }
    });

    var upServices = {};

    upServices.getResources = getResources;
    upServices.downloadResources = downloadResources;
    upServices.deleteResources = deleteResources;
    upServices.createResource = createResource;
    upServices.saveYoutubeUrl = saveYoutubeUrl;
    upServices.postuploadData = postuploadData;
    upServices.deleteZipFile = deleteZipFile;
    return upServices;

    function getResources(type) {
      var deferred = $q.defer();
      dbg.log2('#GalleryServices > getResources > make rest call');
      galleryRestApi.get(type, function(res) {
        dbg.log2('#GalleryServices > getResources > rest call responds');
        deferred.resolve(res);
      });
      return deferred.promise;
    };

    function downloadResources(ids) {
      var deferred = $q.defer();
      dbg.log2('#GalleryServices > downloadGalleryResources > make rest call');
      galleryRestApi.download(ids, function(res) {
        dbg.log2('#GalleryServices > downloadGalleryResources > rest call responds');
        deferred.resolve(res);
      });
      return deferred.promise;
    };

    function deleteResources(ids) {
      var deferred = $q.defer();

      dbg.log2('#GalleryServices > deleteGalleryResources > make rest call');
      galleryRestApi.delete(ids, function(res) {
        dbg.log2('#GalleryServices > deleteGalleryResources > rest call responds');
        deferred.resolve(res);
      });

      return deferred.promise;
    };

    function createResource(params) {
      var deferred = $q.defer();

      dbg.log2('#GalleryServices > createGalleryResources > make rest call');
      galleryRestApi.save(params, function(res) {
        dbg.log2('#GalleryServices > createGalleryResources > rest call responds');
        deferred.resolve(res);
      });

      return deferred.promise;
    }

    function postuploadData(newResource){
      var deferred = $q.defer();

      Upload.upload({
        url: globalSettings.restUrl+'/gallery/uploadFile',
        method: 'POST',
        data: {uploadedfile: newResource.file, type: newResource.type}
      }).then(function(res) {
          deferred.resolve(res);
        }, function(error) {
          deferred.resolve({error: "The file is to large, you can upload a file that is not larger then 2mb."});
        });

      return deferred.promise;
    }

    function saveYoutubeUrl(params) {
      var deferred = $q.defer();

      dbg.log2('#GalleryServices > saveYoutubeUrlResources > make rest call');
      galleryRestApi.saveYoutubeUrl(params, function(res) {
        dbg.log2('#GalleryServices > saveYoutubeUrlResources > rest call responds');
        deferred.resolve(res);
      });

      return deferred.promise;
    }

    function deleteZipFile(params) {
      var deferred = $q.defer();

      dbg.log2('#GalleryServices > deleteZipFile > make rest call');
      galleryRestApi.deleteZipFile(params, function(res) {
        dbg.log2('#GalleryServices > deleteZipFile > rest call responds');
        deferred.resolve(res);
      });

      return deferred.promise;
    }
  };
})();
