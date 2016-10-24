(function () {
  'use strict';

  angular.module('KliikoApp.account', []).factory('account', accountFactory);

  accountFactory.$inject = ['$q', 'globalSettings', '$resource', 'dbg'];
  function accountFactory($q, globalSettings, $resource, dbg) {

    var accountRestApi = $resource(globalSettings.restUrl + '/account', {}, {});

    var account = {};

    var UserService = {};
    UserService.getAccountData = getAccountData;
    UserService.createNewAccount = createNewAccount;
    return UserService;

    function getAccountData() {
      dbg.log2('#KliikoApp.account > get account');
      var deferred = $q.defer();

      accountRestApi.get({}, function (res) {
        dbg.log2('#KliikoApp.account > get account > server respond >', res);
        if(res.error) {
          deferred.reject(res.error);
        }
        else {
          account = res;
          fetchSubscription(account);
          deferred.resolve(account);
        }
      });

      return deferred.promise;
    }

    function createNewAccount(data) {
      var deferred = $q.defer();

      accountRestApi.post(data, function (res) {
        if (res.error) {
          deferred.reject(res.error);
        } else {
          //todo ???
          deferred.resolve(res);
        }
      });

      return deferred.promise;
    }

    function fetchSubscription(account) {
      account["isActiveSubscription"] = account.Subscription ? account.Subscription.active : false;
    }
  }
})();
