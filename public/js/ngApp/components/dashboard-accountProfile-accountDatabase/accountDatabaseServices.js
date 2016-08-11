(function () {
  'use strict';
  angular.module('KliikoApp').factory('AccountDatabaseServices', AccountDatabaseServices);
  AccountDatabaseServices.$inject = ['globalSettings', '$q', '$resource', 'dbg'];

  function AccountDatabaseServices(globalSettings, $q, $resource, dbg) {
    var accountDatabaseRestApi = {
      accountDatabase: $resource(globalSettings.restUrl +'/accountDatabase/:id/', null, { update: { method: 'PUT' } }),
      comment: $resource(globalSettings.restUrl +'/accountDatabase/:id/comment', null, { update: { method: 'PUT', params: { id: '@id' } } })
    };

    var upServices = {};

    upServices.getAccountDatabases = getAccountDatabases;
    upServices.updateAccountUser = updateAccountUser;
    upServices.updateAccountUserComment = updateAccountUserComment;
    return upServices;

    function getAccountDatabases() {
      var deferred = $q.defer();

      dbg.log2('#AccountDatabaseServices > getAccountDatabases > make rest call');
      accountDatabaseRestApi.accountDatabase.get({}, function(res) {
        dbg.log2('#AccountDatabaseServices > getAccountDatabases > rest call responds');
        deferred.resolve(res);
      });

      return deferred.promise;
    };

    function updateAccountUser(data) {
      var deferred = $q.defer();

      dbg.log2('#AccountDatabaseServices > updateAccountUser > make rest call', data);
      accountDatabaseRestApi.accountDatabase.update({ id: data.accountId }, data, function(res) {
        dbg.log2('#AccountDatabaseServices > updateAccountUser > rest call responds');
        deferred.resolve(res);
      });

      return deferred.promise;
    };

    function updateAccountUserComment(params) {
      var deferred = $q.defer();

      dbg.log2('#AccountDatabaseServices > updateAccountUserComment > make rest call', params);
      accountDatabaseRestApi.comment.update(params, function(res) {
        dbg.log2('#AccountDatabaseServices > updateAccountUserComment > rest call responds');
        deferred.resolve(res);
      });

      return deferred.promise;
    };
  };
})();
