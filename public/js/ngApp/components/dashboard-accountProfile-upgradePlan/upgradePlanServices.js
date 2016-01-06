(function () {
  'use strict';
  angular.module('KliikoApp').factory('upgradePlanServices', upgradePlanServices);

  upgradePlanServices.$inject = ['$q', 'globalSettings', '$resource', 'dbg', '$ocLazyLoad', '$injector'];
  function upgradePlanServices($q, globalSettings, $resource, dbg, $ocLazyLoad, $injector) {
    var cache = {};
    var upServices = {};
    var creditCard, chargebee;

    var upgradePlanRestApi = {
      getAllCountries: $resource(globalSettings.restUrl + '/countries', {}, {post: {method: 'POST'}}),
      getAllCurrencies: $resource(globalSettings.restUrl + '/currencies', {}, {post: {method: 'POST'}}),
      getPlans: $resource(globalSettings.restUrl + '/plans', {}, {post: {method: 'POST'}}),
      upgrade: $resource(globalSettings.restUrl + '/upgrade', {}, {post: {method: 'POST'}}),
      chargebee: $resource(globalSettings.restUrl + globalSettings.paymentModules.chargebee.apiEndPoint, {}, {post: {method: 'POST'}})
    };



    upServices.getPlans = getPlans;
    upServices.submitUpgrade = submitUpgrade;
    upServices.initPaymentModule = initPaymentModule;



    return upServices;




    function getPlans() {
      var deferred = $q.defer();

      if (cache.getPlans) {
        deferred.resolve(cache.getPlans);
        dbg.log2('#upgradePlanServices > getPlans > return cached value');
        return deferred.promise;
      }

      dbg.log2('#upgradePlanServices > getPlans > make rest call');
      upgradePlanRestApi.getPlans.get({}, function (res) {
        dbg.log2('#upgradePlanServices > getPlans > rest call responds');
        deferred.resolve(res);
        cache.getPlans = res;
      });

      return deferred.promise;

    }



    /**
     * Submit Payment
     * @param planDetails
     * @param paymentDetails
     */
    function submitUpgrade(planDetails, paymentDetails, userData) {
      var deferred = $q.defer();

      dbg.log2('upgradePlanServices > submitUpgrade > payment details submitted to back end ', planDetails, paymentDetails);

      chargebee.submitNewOrder(planDetails, paymentDetails, userData).then(
        function(res) {deferred.resolve(res)},
        function(err) {deferred.reject(err)}
      );

      return deferred.promise;

    }

    function initPaymentModule() {
      $ocLazyLoad.load('/js/ngApp/modules/chargebee/chargebee.js').then(function() {
        chargebee = $injector.get('chargebee');
        dbg.log2('#UpgradePlanController > validateStep2 > chargebee is ready to use');
      });
    }
  }

})();



