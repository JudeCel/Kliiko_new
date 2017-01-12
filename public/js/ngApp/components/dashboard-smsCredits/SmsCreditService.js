(function () {
  'use strict';
  angular.module('KliikoApp').factory('SmsCreditService', SmsCreditService);
  SmsCreditService.$inject = ['$q', '$resource', 'dbg'];

  function SmsCreditService($q, $resource, dbg) {
    var smsCreditServiceRestApi = $resource('/subscriptionSmsCredits/:path', null, {
      puchaseCredits: { method: 'POST', params: { path: 'puchaseCredits' } },
      creditCount: { method: 'GET', params: { path: 'creditCount' } }
    });

    var scService = {};

    scService.getAllCreditPlans = getAllCreditPlans;
    scService.puchaseCredits = puchaseCredits;
    scService.creditCount = creditCount;

    return scService;

    function getAllCreditPlans() {
      var deferred = $q.defer();
      dbg.log2('#SubscriptionPlanService > getAllCreditPlans > make rest call');
      smsCreditServiceRestApi.get({}, function(res) {
        dbg.log2('#SubscriptionPlanService > getAllCreditPlans > rest call responds');
        deferred.resolve(res);
      });
      return deferred.promise;
    };

    function creditCount() {
      var deferred = $q.defer();
      dbg.log2('#SubscriptionPlanService > creditCount > make rest call');
      smsCreditServiceRestApi.creditCount({}, function(res) {
        dbg.log2('#SubscriptionPlanService > creditCount > rest call responds');
        deferred.resolve(res);
      });
      return deferred.promise;
    }

    function puchaseCredits(params) {
      var deferred = $q.defer();
      dbg.log2('#SubscriptionPlanService > puchaseCredits > make rest call');
      smsCreditServiceRestApi.puchaseCredits(params, function(res) {
        dbg.log2('#SubscriptionPlanService > puchaseCredits > rest call responds');
        deferred.resolve(res);
      });
      return deferred.promise;
    }
  };
})();
