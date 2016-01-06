(function () {
  'use strict';

  angular.module('chargebee', []).factory('chargebee', chargebeeFactory);

  chargebeeFactory.$inject = ['$q','globalSettings', '$resource', 'dbg'];
  function chargebeeFactory($q, globalSettings, $resource, dbg)  {
    var chargebeeApi = {
      newOrder: $resource(globalSettings.restUrl + globalSettings.paymentModules.chargebee.apiEndPoint, {}, {post: {method: 'POST'}})
    };

    var chargebeeFactoryPublicMethods = {};

    chargebeeFactoryPublicMethods.submitNewOrder = submitNewOrder;

    return chargebeeFactoryPublicMethods;


    function submitNewOrder(planDetails, paymentDetails, userData) {
      var deferred = $q.defer();

      chargebeeApi.newOrder.post({}, {
        planDetails: planDetails,
        paymentDetails: paymentDetails,
        userData:userData,
        pages: {
          redirect_url: window.location.href+'?step=5',
          cancel_url: window.location.href,
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
  }


})();

