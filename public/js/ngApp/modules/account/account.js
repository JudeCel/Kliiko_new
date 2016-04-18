(function () {
  'use strict';

  angular.module('KliikoApp.account', []).factory('account', accountFactory);

  accountFactory.$inject = ['$q', 'globalSettings', '$resource', 'dbg'];
  function accountFactory($q, globalSettings, $resource, dbg) {

    var accountRestApi = $resource(globalSettings.restUrl + '/account', {}, {});

    var account = {};

    var UserService = {};
    UserService.getAccountData = getAccountData;
    return UserService;

    function getAccountData(forceUpdate) {
      dbg.log2('#KliikoApp.account > get all account details');
      var deferred = $q.defer();

      if(account && account.id && !forceUpdate) {
        dbg.log2('#KliikoApp.account > get all account details > return cached value');
        deferred.resolve(account);
        return deferred.promise;
      }

      dbg.log2('#KliikoApp.account > get all account details > will return value from server');
      accountRestApi.get({}, function (res) {
        dbg.log2('#KliikoApp.account > get all account details > server respond >', res);
        account = res;
        fetchSubscription(account);
        deferred.resolve(account);
      });

      return deferred.promise;
    }

    function fetchSubscription(account) {
      account["isActiveSubscription"] = account.Subscription.active;
    }
  }
})();
