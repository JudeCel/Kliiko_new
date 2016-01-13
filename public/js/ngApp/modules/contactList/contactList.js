(function () {
  'use strict';

  angular.module('contactList', []).factory('contactList', contactListFactory);

  contactListFactory.$inject = ['$q','globalSettings', '$resource', 'dbg'];
  function contactListFactory($q, globalSettings, $resource, dbg)  {
    var contactListApi = {
      newOrder: $resource(globalSettings.restUrl +  'contactLists', {}, {post: {method: 'POST'}}),
      plans: $resource(globalSettings.restUrl + globalSettings.paymentModules.chargebee.apiEndPoint+'/plans', {}, {post: {method: 'POST'}}),
      coupon: $resource(globalSettings.restUrl + globalSettings.paymentModules.chargebee.apiEndPoint+'/coupon', {}, {post: {method: 'POST'}})
    };


    function getPlans() {
      var deferred = $q.defer();

      contactListApi.lists.get(function(res) {
        deferred.resolve(res);
      });
      return deferred.promise;
    }
  }
})();
