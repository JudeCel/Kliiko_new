(function () {
  'use strict';

  angular.module('KliikoApp.account', []).factory('account', accountFactory);

  accountFactory.$inject = ['$q', 'globalSettings', 'authResource', 'dbg'];
  function accountFactory($q, globalSettings, authResource, dbg) {

    var accountRestApi = authResource('/account', {}, {post: {method: 'POST'}});

    var UserService = {};
    UserService.getAccountData = getAccountData;
    UserService.createNewAccount = createNewAccount;
    UserService.account = {};
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
          UserService.account = res;
          fetchSubscription(UserService.account);
          deferred.resolve(UserService.account);
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
          deferred.resolve(res);
        }
      });

      return deferred.promise;
    }

    function fetchSubscription(account) {
      UserService.account["isActiveSubscription"] = UserService.account.Subscription ? UserService.account.Subscription.active : false;
    }
  }
})();
