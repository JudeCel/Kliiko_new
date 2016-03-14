(function () {
  'use strict';
  angular.module('KliikoApp').factory('planService', planService);

  planService.$inject = ['$q', 'globalSettings', '$resource', 'dbg', '$ocLazyLoad', '$injector'];
  function planService($q, globalSettings, $resource, dbg, $ocLazyLoad, $injector) {

    var subscriptionPlanRestApi = $resource(globalSettings.restUrl + '/subscriptionPlan/:path', null, {

    });

    var spService = {};

    spService.getAllPlans = getAllPlans;
    return spService;

    function getAllPlans() {
      var deferred = $q.defer();
      dbg.log2('#SubscriptionPlanService > getAllPlans > make rest call');
      subscriptionPlanRestApi.get({}, function(res) {
        dbg.log2('#SubscriptionPlanService > getAllPlans > rest call responds');
        deferred.resolve(res);
      });
      return deferred.promise;
    };

  }
})();
