(function () {
  'use strict';
  angular.module('KliikoApp').factory('upgradePlanServices', upgradePlanServices);

  upgradePlanServices.$inject = ['$q', 'globalSettings', '$resource', 'dbg', '$ocLazyLoad', '$injector'];
  function upgradePlanServices($q, globalSettings, $resource, dbg, $ocLazyLoad, $injector) {
    var cache = {};
    var upServices = {};
    var chargebee;

    var upgradePlanRestApi = {
      getAllCountries: $resource(globalSettings.restUrl + '/countries', {}, {post: {method: 'POST'}}),
      getAllCurrencies: $resource(globalSettings.restUrl + '/currencies', {}, {post: {method: 'POST'}}),
      //getPlans: $resource(globalSettings.restUrl + '/plans', {}, {post: {method: 'POST'}}),
    };

    upServices.init = init;
    upServices.getPlans = getPlans;
    upServices.submitUpgrade = submitUpgrade;

    return upServices;

    function init() {
      var deferred = $q.defer();

      if (chargebee) { deferred.resolve(); return deferred.promise;}

      $ocLazyLoad.load('/js/ngApp/modules/chargebee/chargebee.js').then(function() {
        deferred.resolve();
        chargebee = $injector.get('chargebee');
        dbg.log2('#UpgradePlanController > init > chargebee is ready to use');
      });
      return deferred.promise;
    }



    function getPlans() {
      var deferred = $q.defer();

      if (cache.getPlans) {
        deferred.resolve(cache.getPlans);
        dbg.log2('#upgradePlanServices > getPlans > return cached value');
        return deferred.promise;
      }

      dbg.log2('#upgradePlanServices > getPlans > call chargebee');
      chargebee.getPlans().then(
        function(res) { deferred.resolve(res) },
        function(err) {deferred.reject(err) }
      );


      //upgradePlanRestApi.getPlans.get({}, function (res) {
      //  dbg.log2('#upgradePlanServices > getPlans > rest call responds');
      //  deferred.resolve(res);
      //  cache.getPlans = res;
      //});

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

  }

})();



