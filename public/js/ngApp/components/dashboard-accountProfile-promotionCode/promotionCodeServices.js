(function () {
  'use strict';
  angular.module('KliikoApp').factory('PromotionCodeServices', PromotionCodeServices);
  PromotionCodeServices.$inject = ['$q', '$resource', 'dbg'];

  function PromotionCodeServices($q, $resource, dbg) {
    var promotionCodeRestApi = {
      promotionCode: $resource('/api/promotionCode/:id', null, { update: { method: 'PUT' } })
    };

    var cache = {};
    var upServices = {};

    upServices.getPromotionCodes = getPromotionCodes;
    upServices.createPromoCode = createPromoCode;
    upServices.removePromoCode = removePromoCode;
    upServices.updatePromoCode = updatePromoCode;
    return upServices;

    function getPromotionCodes() {
      var deferred = $q.defer();

      if(cache.allManagers) {
        deferred.resolve(cache.allManagers);
        dbg.log2('#PromotionCodeServices > getPromotionCodes > return cached value');
        return deferred.promise;
      }

      dbg.log2('#PromotionCodeServices > getPromotionCodes > make rest call');
      promotionCodeRestApi.promotionCode.get({}, function(res) {
        dbg.log2('#PromotionCodeServices > getPromotionCodes > rest call responds');
        deferred.resolve(res);
        cache.allManagers = res;
      });

      return deferred.promise;
    };

    function createPromoCode(data) {
      var deferred = $q.defer();

      dbg.log2('#PromotionCodeServices > createPromoCode > make rest call', data);
      promotionCodeRestApi.promotionCode.save(data, function(res) {
        dbg.log2('#PromotionCodeServices > createPromoCode > rest call responds');
        deferred.resolve(res);
      });

      return deferred.promise;
    };

    function removePromoCode(promoId) {
      var deferred = $q.defer();

      dbg.log2('#PromotionCodeServices > removePromoCode > make rest call', promoId);
      promotionCodeRestApi.promotionCode.delete({ id: promoId }, function(res) {
        dbg.log2('#PromotionCodeServices > removePromoCode > rest call responds');
        deferred.resolve(res);
      });

      return deferred.promise;
    };

    function updatePromoCode(data) {
      var deferred = $q.defer();

      dbg.log2('#PromotionCodeServices > updatePromoCode > make rest call', data);
      promotionCodeRestApi.promotionCode.update({ id: data.id }, data, function(res) {
        dbg.log2('#PromotionCodeServices > updatePromoCode > rest call responds');
        deferred.resolve(res);
      });

      return deferred.promise;
    };
  };
})();
