(function () {
  'use strict';
  angular.module('KliikoApp').factory('bannerMessagesService', bannerMessagesService);
  bannerMessagesService.$inject = ['globalSettings', '$q', '$resource', 'dbg', 'Upload', '$timeout'];

  function bannerMessagesService(globalSettings, $q, $resource, dbg, Upload, $timeout) {
    var bannerMessagesRestApi = {
      banners: $resource(globalSettings.restUrl +'/banners/:bannerType', {bannerType: '@bannerType'})
    };

    var bServices = {};

    bServices.getAllBanners = getAllBanners;
    bServices.upload = upload;
    bServices.remove = remove;
    bServices.saveLink = saveLink;

    return bServices;

    /**
     * Fetch all banners
     * expect an object like {pageName: bannerURL, ...}
     * @returns {promise.promise|*|jQuery.promise|d.promise|promise|r.promise}
     */
    function getAllBanners() {
      var deferred = $q.defer();

      bannerMessagesRestApi.banners.get(function(res) {
        deferred.resolve(res);
      });

      return deferred.promise;
    }

    function upload(file, bannerType) {
      var deferred = $q.defer();

      if (file && !file.$error) {
        Upload.upload({
          url: globalSettings.restUrl+'/banners',
          method: 'POST',
          data: {bannerType:bannerType, file: file}
        }).then(
          function(res) {
            dbg.log2('#bannerMessagesService > upload > success ', res);
            deferred.resolve();
          },
          function(err) {
            dbg.log2('#bannerMessagesService > upload > error ', err);
            deferred.reject( {status:err.status, statusText: err.statusText})
          },
          function(evt) {}
        );
      }

      return deferred.promise;
    }

    function remove(bannerType) {
      var deferred = $q.defer();
      bannerMessagesRestApi.banners.delete({bannerType: bannerType}, {}, function(res) {
        deferred.resolve(res);
      });

      return deferred.promise;

    }

    function saveLink(bannerType, link) {
      var deferred = $q.defer();


      bannerMessagesRestApi.banners.save({bannerType: bannerType}, {link: link}, function(res) {
        console.log(res);
        deferred.resolve(res);
      });

      return deferred.promise;
    }
  }
})();
