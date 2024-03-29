(function () {
  'use strict';

  angular.module('KliikoApp.accountUser', []).factory('accountUser', accountUserFactory);

  accountUserFactory.$inject = ['$q', '$resource', 'dbg'];
  function accountUserFactory($q, $resource, dbg) {
    var accountUserRestApi = $resource('/accountUser');

    var vm = {};
    vm.getAccountUserData = getAccountUserData;
    vm.accountUser = {};
    return vm;

    function getAccountUserData() {
      dbg.log2('#KliikoApp.accountUser > get accountuser');
      var deferred = $q.defer();

      accountUserRestApi.get({}, function (res) {
        dbg.log2('#KliikoApp.accountUser > get accountuser > server respond >', res);
        vm.fetchingData = null;
        if(res.error) {
          deferred.reject(res.error);
        }
        else {
          deferred.resolve(res);
        }
      });

      return deferred.promise;
    }
  }
})();
