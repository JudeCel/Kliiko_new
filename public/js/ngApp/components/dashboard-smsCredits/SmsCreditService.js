(function () {
  'use strict';
  angular.module('KliikoApp').factory('SmsCreditService', SmsCreditService);
  SmsCreditService.$inject = ['globalSettings', '$q', '$resource', 'dbg'];

  function SmsCreditService(globalSettings, $q, $resource, dbg) {
    var smsCreditServiceRestApi = $resource(globalSettings.restUrl + '/subscriptionSmsCredits/:path', null, {
      puchaseCredits: { method: 'POST', params: { path: 'puchaseCredits' } },
    });

    var scService = {};

    scService.getAllCreditPlans = getAllCreditPlans;
    scService.puchaseCredits = puchaseCredits;

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
