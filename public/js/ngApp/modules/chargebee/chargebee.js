(function () {
  'use strict';

  angular.module('chargebee', []).factory('chargebee', chargebeeFactory);

  chargebeeFactory.$inject = ['$q','globalSettings', '$resource', 'dbg'];
  function chargebeeFactory($q, globalSettings, $resource, dbg)  {
    var chargebeeApi = {
<<<<<<< HEAD
      newOrder: $resource(globalSettings.restUrl + globalSettings.paymentModules.chargebee.apiEndPoint+'/subscription', {}, {post: {method: 'POST'}}),
=======
      subscription: $resource(globalSettings.restUrl + globalSettings.paymentModules.chargebee.apiEndPoint+'/subscription', {}, {post: {method: 'POST'}, put: {method: 'PUT'}}),
>>>>>>> 0164a3229c7e875da662854f5117db0ff438182e
      plans: $resource(globalSettings.restUrl + globalSettings.paymentModules.chargebee.apiEndPoint+'/plans', {}, {post: {method: 'POST'}}),
      coupon: $resource(globalSettings.restUrl + globalSettings.paymentModules.chargebee.apiEndPoint+'/coupon', {}, {post: {method: 'POST'}})
    };


    var chargebeeFactoryPublicMethods = {};

    chargebeeFactoryPublicMethods.getPlans = getPlans;
<<<<<<< HEAD
    chargebeeFactoryPublicMethods.submitNewOrder = submitNewOrder;
=======
    chargebeeFactoryPublicMethods.submitNewSubscription = submitNewSubscription;
    chargebeeFactoryPublicMethods.updateSubscription = updateSubscription;

>>>>>>> 0164a3229c7e875da662854f5117db0ff438182e
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
<<<<<<< HEAD
    function submitNewOrder(planDetails, paymentDetails, userData) {
=======
    function submitNewSubscription(planDetails, paymentDetails, userData) {
>>>>>>> 0164a3229c7e875da662854f5117db0ff438182e
      var deferred = $q.defer();

      chargebeeApi.subscription.post({}, {
        planDetails: planDetails,
        paymentDetails: paymentDetails,
        userData:userData,
        pages: {
<<<<<<< HEAD
          redirect_url: window.location.origin+'/webhooks/chargebeeHostedPageSuccess',
          cancel_url: window.location.href
        },
        passThruContent: JSON.stringify({
          userId: userData.id,
          successAppUrl: window.location.href+'?step=5'
        })
=======
          redirect_url: window.location.origin+'/webhooks/chargebee/hostedPageSuccess',
          cancel_url: window.location.href
        },
        passThruContent: {
          userId: userData.id,
          successAppUrl: window.location.href+'?step=5'
        }
>>>>>>> 0164a3229c7e875da662854f5117db0ff438182e
      },  function(res) {
        if (res.error) {
          deferred.reject(res.error);
        } else {
          deferred.resolve(res);
        }
      });

      return deferred.promise;

    }

<<<<<<< HEAD
=======
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
>>>>>>> 0164a3229c7e875da662854f5117db0ff438182e

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

