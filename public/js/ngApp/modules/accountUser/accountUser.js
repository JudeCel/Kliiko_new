(function () {
  'use strict';

  angular.module('KliikoApp.accountUser', []).factory('accountUser', accountUserFactory);

  accountUserFactory.$inject = ['$q', 'globalSettings', '$resource', 'dbg'];
  function accountUserFactory($q, globalSettings, $resource, dbg) {

    var accountUserRestApi = $resource(globalSettings.restUrl + '/accountUser', {}, {});

    var accountUser = {};

    var AccountUserService = {};
    AccountUserService.getAccountUserData = getAccountUserData;
    AccountUserService.isAdmin = isAdmin;
    return AccountUserService;

    function getAccountUserData() {
      dbg.log2('#KliikoApp.accountUser > get accountuser');
      var deferred = $q.defer();

      accountUserRestApi.get({}, function (res) {
        dbg.log2('#KliikoApp.accountUser > get accountuser > server respond >', res);
        if(res.error) {
          deferred.reject(res.error);
        }
        else {
          accountUser = res;
          fetchRole(accountUser);
          deferred.resolve(accountUser);
        }
      });

      return deferred.promise;
    }

    function isAdmin() {
      return accountUser.isAdmin;
    }

    function fetchRole(accountUser) {
      var role = 'is'+ accountUser.role.capitalize();
      accountUser[role] = true;
    }
  }
})();
