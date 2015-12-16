(function () {
  'use strict';
  angular.module('KliikoApp').factory('AccountManagerServices', AccountManagerServices);
  AccountManagerServices.$inject = ['$q', 'globalSettings', '$resource', 'dbg'];

  function AccountManagerServices($q, globalSettings, $resource, dbg) {
    var accountManagerRestApi = {
      accountManager: $resource(globalSettings.restUrl + '/accountManager', {}, { post: { method: 'POST' } }),
      accountManagerRemove: $resource(globalSettings.restUrl + '/accountManager/remove', {}, { post: { method: 'POST' } })
    };

    var cache = {};
    var upServices = {};

    upServices.getAllManagersList = getAllManagersList;
    upServices.sendAccountManagerData = sendAccountManagerData;
    upServices.removeAccountManager = removeAccountManager;
    return upServices;

    function getAllManagersList() {
      var deferred = $q.defer();

      if(cache.allManagers) {
        deferred.resolve(cache.allManagers);
        dbg.log2('#AccountManagerServices > getAllManagersList > return cached value');
        return deferred.promise;
      }

      dbg.log2('#AccountManagerServices > getAllManagersList > make rest call');
      accountManagerRestApi.accountManager.get({}, function(res) {
        dbg.log2('#AccountManagerServices > getAllManagersList > rest call responds');
        deferred.resolve(res);
        cache.allManagers = res;
      });

      return deferred.promise;
    };

    function sendAccountManagerData(data) {
      var deferred = $q.defer();

      dbg.log2('#AccountManagerServices > sendAccountManagerData > make rest call', data);
      accountManagerRestApi.accountManager.save(data, function(res) {
        dbg.log2('#AccountManagerServices > sendAccountManagerData > rest call responds');
        deferred.resolve(res);
      });

      return deferred.promise;
    };

    function removeAccountManager(data) {
      var deferred = $q.defer();

      dbg.log2('#AccountManagerServices > removeAccountManager > make rest call', data);
      accountManagerRestApi.accountManagerRemove.get(data, function(res) {
        dbg.log2('#AccountManagerServices > removeAccountManager > rest call responds');
        deferred.resolve(res);
      });

      return deferred.promise;
    };
  };
})();
