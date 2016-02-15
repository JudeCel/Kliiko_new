(function () {
  'use strict';

  angular.module('KliikoApp.accountUser', []).factory('accountUser', accountUserFactory);

  accountUserFactory.$inject = ['$q', 'globalSettings', '$resource', 'dbg'];
  function accountUserFactory($q, globalSettings, $resource, dbg) {

    var accountUserRestApi = $resource(globalSettings.restUrl + '/accountUser', {}, {});

    var accountUser = {};

    var UserService = {};
    UserService.getAccountUserData = getAccountUserData;
    return UserService;

    function getAccountUserData(forceUpdate) {
      dbg.log2('#KliikoApp.user > get all accountuser details');
      var deferred = $q.defer();
      
      if(accountUser && accountUser.id && !forceUpdate) {
        dbg.log2('#KliikoApp.user > get all accountuser details > return cached value');
        deferred.resolve(accountUser);
        return deferred.promise;
      }

      dbg.log2('#KliikoApp.user > get all accountuser details > will return value from server');
      accountUserRestApi.get({}, function (res) {
        dbg.log2('#KliikoApp.user > get all accountuser details > server respond >', res);
        accountUser = res;
        deferred.resolve(accountUser);
      });

      return deferred.promise;
    }
  }
})();
