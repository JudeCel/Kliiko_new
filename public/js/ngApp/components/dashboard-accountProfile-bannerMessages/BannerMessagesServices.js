(function () {
  'use strict';
  angular.module('KliikoApp').factory('BannerMessagesServices', BannerMessagesServices);
  BannerMessagesServices.$inject = ['globalSettings', '$q', '$resource', 'dbg'];

  function BannerMessagesServices(globalSettings, $q, $resource, dbg) {
    var bannerRestApi = $resource(globalSettings.restUrl + '/banners');

    var bms = {};
    bms.createBanner = createBanner;
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
  }
})();
