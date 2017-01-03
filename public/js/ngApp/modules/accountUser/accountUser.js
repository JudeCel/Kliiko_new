(function () {
  'use strict';

  angular.module('KliikoApp.accountUser', []).factory('accountUser', accountUserFactory);

  accountUserFactory.$inject = ['$q', 'globalSettings', 'authResource', 'dbg'];
  function accountUserFactory($q, globalSettings, authResource, dbg) {
    var accountUserRestApi = authResource('/accountUser');

    var vm = {};
    vm.getAccountUserData = getAccountUserData;
    vm.isAdmin = isAdmin;
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
          vm.accountUser = res;
          fetchRole();
          deferred.resolve(vm.accountUser);
        }
      });

      return deferred.promise;
    }

    function isAdmin() {
      return vm.accountUser.isAdmin;
    }

    function fetchRole() {
      var role = 'is' + vm.accountUser.role.capitalize();
      vm.accountUser[role] = true;
    }
  }
})();
