(function () {
  'use strict';

  angular.module('KliikoApp.banners', []).factory('banners', bannersFactory);

  bannersFactory.$inject = ['globalSettings', '$q', '$resource', 'dbg', '$ocLazyLoad', '$injector', '$rootScope'];
  function bannersFactory(globalSettings, $q, $resource, dbg, $ocLazyLoad, $injector, $rootScope) {
    var Upload, bannersCache, currentBannerType;
    var bannersPublicMethods = {};

    var bannerMessagesRestApi = {
      banners: $resource(globalSettings.restUrl +'/banners/:bannerType', {bannerType: '@bannerType'})
    };

    bannersPublicMethods.initUpload = initUpload;
    bannersPublicMethods.getAllBanners = getAllBanners;
    bannersPublicMethods.upload = upload;
    bannersPublicMethods.remove = remove;
    bannersPublicMethods.saveLink = saveLink;
    bannersPublicMethods.setMainBannerForPage = setMainBannerForPage;

    return bannersPublicMethods;

    /**
     * Will load ng-file-upload module, so it can be used here in public methods
     * @returns {promise.promise|*|jQuery.promise|d.promise|promise|r.promise}
     */
    function initUpload() {
      var deferred = $q.defer();

      if (Upload) {
        deferred.resolve();
        return deferred.promise;
      }

      $ocLazyLoad.load(['/js/vendors/ng-file-upload/ng-file-upload.js']).then(function() {
        Upload = $injector.get('Upload');
        deferred.resolve();
      });

      return deferred.promise;
    }

    /**
     * Fetch all banners
     * expect an object like {pageName: bannerURL, ...}
     * @returns {promise.promise|*|jQuery.promise|d.promise|promise|r.promise}
     */
    function getAllBanners() {
      var deferred = $q.defer();

      if (bannersCache) {
        deferred.resolve(bannersCache);
        return deferred.promise;
      }

      bannerMessagesRestApi.banners.get(function(res) {
        dbg.log2('#banners > getAllBanner > res > ', res);
        bannersCache = res;
        deferred.resolve(res);
      });

      return deferred.promise;
    }

    function upload(file, bannerType) {
      var deferred = $q.defer();

      if (file && !file.$error) {
        bannersCache = null;

        Upload.upload({
          url: globalSettings.restUrl+'/banners',
          method: 'POST',
          data: {bannerType:bannerType, file: file}
        }).then(
          function(res) {
            if (res.data && res.data.error) {
              dbg.log2('#bannerMessagesService > upload > error ', res.data.error);
              deferred.reject(res.data.error);
              return deferred.promise;
            }

            dbg.log2('#bannerMessagesService > upload > success ', res);
            console.warn(currentBannerType)
            if (currentBannerType) setMainBannerForPage(currentBannerType);

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

      bannersCache = null;

      bannerMessagesRestApi.banners.delete({bannerType: bannerType}, {}, function(res) {
        if (currentBannerType) setMainBannerForPage(currentBannerType);
        deferred.resolve(res);
      });

      return deferred.promise;

    }

    function saveLink(bannerType, link) {
      var deferred = $q.defer();

      bannersCache = null;

      bannerMessagesRestApi.banners.save({bannerType: bannerType}, {link: link}, function(res) {
        if (currentBannerType) setMainBannerForPage(currentBannerType);
        deferred.resolve(res);
      });

      return deferred.promise;
    }

    /**
     * Will get existed banners and emit data with the requested one
     * Emission request should be handled by controller
     * @param bannerType
     */
    function setMainBannerForPage(bannerType) {
      currentBannerType = bannerType;
      getAllBanners().then(function(res) {
        $rootScope.$emit('updateMainBanner', {bannerType:bannerType, bannerData:res[bannerType]});
      });

    }
  }

})();

