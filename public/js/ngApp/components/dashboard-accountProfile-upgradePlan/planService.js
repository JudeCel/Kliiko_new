(function () {
  'use strict';
  angular.module('KliikoApp').factory('planService', planService);

  planService.$inject = ['$q', 'globalSettings', '$resource', 'dbg',  '$injector'];
  function planService($q, globalSettings, $resource, dbg, $injector) {

    var subscriptionPlanRestApi = $resource(globalSettings.restUrl + '/subscriptionPlan/:path', null, {
      updatePlan: { method: 'PUT', params: { path: 'updatePlan' } },
      UpdateViaCheckout: { method: 'PUT', params: { path: 'UpdateViaCheckout' } },
      postQuote: { method: 'POST', params: { path: 'postQuote' } },
      checkPermissions: { method: 'GET', params: { path: 'checkPermissions' } }
    });

    var spService = {};

    spService.getAllPlans = getAllPlans;
    spService.updatePlan = updatePlan;
    spService.retrievCheckoutAndUpdateSub = retrievCheckoutAndUpdateSub;
    spService.submitContactusForm = submitContactusForm;
    spService.checkPermissions = checkPermissions;
    return spService;

    function submitContactusForm(params) {
      var deferred = $q.defer();

      dbg.log2('#SubscriptionPlanService > submitContactusForm > make rest call');
      subscriptionPlanRestApi.postQuote(params, function(res) {
        dbg.log2('#SubscriptionPlanService > submitContactusForm > rest call responds');
        deferred.resolve(res);
      });

      return deferred.promise;
    }

    function getAllPlans() {
      var deferred = $q.defer();
      dbg.log2('#SubscriptionPlanService > getAllPlans > make rest call');
      subscriptionPlanRestApi.get({}, function(res) {
        dbg.log2('#SubscriptionPlanService > getAllPlans > rest call responds');
        deferred.resolve(res);
      });
      return deferred.promise;
    };

    function updatePlan(planId) {
      var deferred = $q.defer();
      dbg.log2('#SubscriptionPlanService > updatePlan > make rest call');
      subscriptionPlanRestApi.updatePlan({planId: planId}, function(res) {
        dbg.log2('#SubscriptionPlanService > updatePlan > rest call responds');
        deferred.resolve(res);
      });
      return deferred.promise;
    }

    function retrievCheckoutAndUpdateSub(hostedPageId) {
      var deferred = $q.defer();
      dbg.log2('#SubscriptionPlanService > retrievCheckoutAndUpdateSub > make rest call');
      subscriptionPlanRestApi.UpdateViaCheckout({hostedPageId: hostedPageId}, function(res) {
        dbg.log2('#SubscriptionPlanService > retrievCheckoutAndUpdateSub > rest call responds');
        deferred.resolve(res);
      });
      return deferred.promise;
    }

    function checkPermissions(permissions) {
      var deferred = $q.defer();
      dbg.log2('#SubscriptionPlanService > checkPermissions > make rest call');
      subscriptionPlanRestApi.checkPermissions({permissions: permissions}, function(res) {
        dbg.log2('#SubscriptionPlanService > checkPermissions > rest call responds');
        deferred.resolve(res);
      });
      return deferred.promise;
    };

  }
})();
