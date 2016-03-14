(function () {
  'use strict';
  angular.module('KliikoApp').factory('SmsCreditService', SmsCreditService);
  SmsCreditService.$inject = ['globalSettings', '$q', '$resource', 'dbg', 'Upload'];

  function SmsCreditService(globalSettings, $q, $resource, dbg, Upload) {
    var smsCreditServiceRestApi = $resource(globalSettings.restUrl + '/subscriptionSmsCredits/:path', null, {

    });

    var scService = {};

    scService.getAllCreditPlans = getAllCreditPlans;
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
  };
})();
