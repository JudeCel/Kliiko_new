(function () {
  'use strict';
  angular.module('KliikoApp').factory('BannerMessagesServices', BannerMessagesServices);
  BannerMessagesServices.$inject = ['globalSettings', '$q', '$resource', 'dbg'];

  function BannerMessagesServices(globalSettings, $q, $resource, dbg) {
    var bannerRestApi = $resource(globalSettings.restUrl + '/banners', null, {
      update: { method: 'PUT' }
    });

    var bms = {};
    bms.createBanner = createBanner;
    bms.updateBanner = updateBanner;
    return bms;

    function createBanner(params) {
      var deferred = $q.defer();

      dbg.log2('#BannerMessagesServices > createBanner > make rest call');
      bannerRestApi.save(params, function(res) {
        dbg.log2('#BannerMessagesServices > createBanner > rest call responds', res);

        if(res.error) {
          deferred.reject(res.error);
        }
        else {
          deferred.resolve(res);
        }
      });

      return deferred.promise;
    }

    function updateBanner(params) {
      var deferred = $q.defer();

      dbg.log2('#BannerMessagesServices > updateBanner > make rest call');
      bannerRestApi.update(params, function(res) {
        dbg.log2('#BannerMessagesServices > updateBanner > rest call responds', res);

        if(res.error) {
          deferred.reject(res.error);
        }
        else {
          deferred.resolve(res);
        }
      });

      return deferred.promise;
    }
  }
})();
