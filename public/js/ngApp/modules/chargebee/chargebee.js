(function () {
  'use strict';

  angular.module('chargebee', []).factory('chargebee', chargebeeFactory);

  chargebeeFactory.$inject = ['$q','globalSettings', '$resource', 'dbg'];
  function chargebeeFactory($q, globalSettings, $resource, dbg)  {
    var chargebeeApi = {
      subscription: $resource(globalSettings.restUrl + globalSettings.paymentModules.chargebee.apiEndPoint+'/subscription', {}, {post: {method: 'POST'}, put: {method: 'PUT'}}),
      plans: $resource(globalSettings.restUrl + globalSettings.paymentModules.chargebee.apiEndPoint+'/plans', {}, {post: {method: 'POST'}}),
      coupon: $resource(globalSettings.restUrl + globalSettings.paymentModules.chargebee.apiEndPoint+'/coupon', {}, {post: {method: 'POST'}})
    };


    var chargebeeFactoryPublicMethods = {};

    chargebeeFactoryPublicMethods.getPlans = getPlans;
    chargebeeFactoryPublicMethods.submitNewSubscription = submitNewSubscription;
    chargebeeFactoryPublicMethods.updateSubscription = updateSubscription;

    chargebeeFactoryPublicMethods.validateCoupon = validateCoupon;

    return chargebeeFactoryPublicMethods;



    function getPlans() {
      var deferred = $q.defer();

      chargebeeApi.plans.get(function(res) {
        deferred.resolve(res);
      });
      return deferred.promise;
    }


    /**
     * Call api to create new Chargebee subscription
     * Will return promise with subscription data, that include error_msg or url to chargebee hosted payment page
     * @param planDetails {object}
     * @param paymentDetails {object}
     * @param userData {object}
     * @returns {promise}
     */
    function submitNewSubscription(planDetails, paymentDetails, userData) {
      var deferred = $q.defer();

      chargebeeApi.subscription.post({}, {
        planDetails: planDetails,
        paymentDetails: paymentDetails,
        userData:userData,
        pages: {
          redirect_url: window.location.origin+'/webhooks/chargebee/hostedPageSuccess',
          cancel_url: window.location.href
        },
        passThruContent: {
          userId: userData.id,
          successAppUrl: window.location.href+'?step=5'
        }
      },  function(res) {
        if (res.error) {
          deferred.reject(res.error);
        } else {
          deferred.resolve(res);
        }
      });

      return deferred.promise;

    }

    /**
     * Upgrade existing subscription (prorate)
     * https://apidocs.chargebee.com/docs/api/subscriptions#update_a_subscription
     * @param planDetails
     * @param paymentDetails
     * @param userData
     */
    function updateSubscription(planDetails, paymentDetails, userData) {
      var deferred = $q.defer();


      var deferred = $q.defer();

      chargebeeApi.subscription.put({}, {
        planDetails: planDetails,
        paymentDetails: paymentDetails,
        userData:userData,
      },  function(res) {
        if (res.error) {
          deferred.reject(res.error);
        } else {
          deferred.resolve(res);
        }
      });

      return deferred.promise;
    }

    function validateCoupon(coupon) {
      var deferred = $q.defer();
      chargebeeApi.coupon.get({coupon:coupon}, function(res) {
        if (res.error) {
          deferred.reject(res.error);
          return deferred.promise;
        }
        deferred.resolve(res);
      });
      return deferred.promise;
    }

  }


})();
