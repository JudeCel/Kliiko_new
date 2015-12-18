(function () {
  'use strict';
  angular.module('KliikoApp').factory('AccountDatabaseServices', AccountDatabaseServices);
  AccountDatabaseServices.$inject = ['$q', '$resource', 'dbg'];

  function AccountDatabaseServices($q, $resource, dbg) {
    var accountDatabaseRestApi = {
      accountDatabase: $resource('/api/accountDatabase/:id', null, { update: { method: 'PUT' } })
    };

    var cache = {};
    var upServices = {};

    upServices.getAccountDatabases = getAccountDatabases;
    upServices.updateAccountUser = updateAccountUser;
    return upServices;

    function getAccountDatabases() {
      var deferred = $q.defer();

      if(cache.allManagers) {
        deferred.resolve(cache.allManagers);
        dbg.log2('#AccountDatabaseServices > getAccountDatabases > return cached value');
        return deferred.promise;
      }

      dbg.log2('#AccountDatabaseServices > getAccountDatabases > make rest call');
      accountDatabaseRestApi.accountDatabase.get({}, function(res) {
        dbg.log2('#AccountDatabaseServices > getAccountDatabases > rest call responds');
        deferred.resolve(res);
        cache.allManagers = res;
      });

      return deferred.promise;
    };

    function updateAccountUser(data) {
      var deferred = $q.defer();

      dbg.log2('#PromotionCodeServices > updateAccountUser > make rest call', data);
      accountDatabaseRestApi.accountDatabase.update({ id: data.accountId }, data, function(res) {
        dbg.log2('#PromotionCodeServices > updateAccountUser > rest call responds');
        deferred.resolve(res);
      });

      return deferred.promise;
    };
  };
})();
