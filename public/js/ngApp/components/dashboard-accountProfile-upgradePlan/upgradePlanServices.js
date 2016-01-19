(function () {
  'use strict';
  angular.module('KliikoApp').factory('upgradePlanServices', upgradePlanServices);

  upgradePlanServices.$inject = ['$q', 'globalSettings', '$resource', 'dbg', '$ocLazyLoad', '$injector'];
  function upgradePlanServices($q, globalSettings, $resource, dbg, $ocLazyLoad, $injector) {
    var cache = {};
    var upServices = {};
    var chargebee;

    upServices.init = init;
    upServices.getPlans = getPlans;
    upServices.submitUpgrade = submitUpgrade;
    upServices.validatePromocode = validatePromocode;
    upServices.calculateDiscount = calculateDiscount;

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
        function(err) { deferred.reject(err) }
      );

      return deferred.promise;

    }

    /**
     * Submit Payment
     * @param planDetails {object}
     * @param paymentDetails {object}
     * @param userData {object}
     */
    function submitUpgrade(planDetails, paymentDetails, userData) {
      var deferred = $q.defer();

      dbg.log2('upgradePlanServices > submitUpgrade > payment details submitted to chargebee module ', planDetails, paymentDetails);

      if (userData.subscriptions && userData.subscriptions.subscriptionId) {
        // upgrade and prorate plan
        var valid = validateUpgrading();

        if (!valid) { deferred.reject('Are you cheating?'); return deferred.promise; }

        chargebee.updateSubscription(planDetails, paymentDetails, userData).then(
          function(res) {deferred.resolve(res)},
          function(err) {deferred.reject(err)}
        );
      } else {
        // new order
        chargebee.submitNewSubscription(planDetails, paymentDetails, userData).then(
          function(res) {deferred.resolve(res)},
          function(err) {deferred.reject(err)}
        );
      }



      return deferred.promise;

      /**
       * Downgrading is not allowed.
       * Every desired plan should be grater, then current
       * @returns {boolean}
       */
      function validateUpgrading() {
        var desiredPlan = planDetails.plan.id.replace(/\D/g,'');
        var currentPlan = userData.subscriptions.planId.replace(/\D/g,'');

        if (desiredPlan <= currentPlan) return false;

        return true;
      }

    }

    function validatePromocode(promocode) {
      var deferred = $q.defer();

      chargebee.validateCoupon(promocode).then(
        function(res) {
          cache.promocode = res;
          deferred.resolve(res);
        },
        function(err) { deferred.reject(err) }
      );

      return deferred.promise;
    }

    /**
     * Calculate discount in usd, based on coupon
     * example of coupon object:
     * {"id":"tst3","name":"-50%","invoice_name":"-50%","discount_type":"percentage","discount_percentage":50,"duration_type":"forever","status":"active","apply_discount_on":"not_applicable","apply_on":"invoice_amount","plan_constraint":"not_applicable","addon_constraint":"not_applicable","created_at":1452232599,"object":"coupon","redemptions":0}
     * @param total {number}
     * @returns {number}
     */
    function calculateDiscount(total) {
      if (!total || !cache.promocode) return;

      var output = total;

      if (cache.promocode.discount_type.indexOf('fixed') > -1) {
        //calculate fixed discount
        var amount = cache.promocode.discount_amount;
        output = amount;
      } else {
        //calculate percentage
        var amount = cache.promocode.discount_percentage;
        output = output * (amount/100);
      }

      return output;
    }

  }

})();



