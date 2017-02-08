(function () {
  'use strict';
  angular.module('KliikoApp').factory('AccountDatabaseServices', AccountDatabaseServices);
  AccountDatabaseServices.$inject = ['$q', '$resource', 'dbg'];

  function AccountDatabaseServices($q, $resource, dbg) {
    var accountDatabaseRestApi = {
      accountDatabase: $resource('/accountDatabase/:id/', null, { update: { method: 'PUT' } }),
      addAdmin: $resource('/accountDatabase/:id/addAdmin', null, { post: { method: 'POST' } }),
      remAdmin: $resource('/accountDatabase/:id/remAdmin', null, { post: { method: 'POST' } }),
      comment: $resource('/accountDatabase/:id/comment', null, { update: { method: 'PUT', params: { id: '@id' } } })
    };

    var upServices = {};

    upServices.getAccountDatabases = getAccountDatabases;
    upServices.updateAccountUser = updateAccountUser;
    upServices.updateAccountUserComment = updateAccountUserComment;
    upServices.addAdmin = addAdmin;
    upServices.remAdmin = remAdmin;
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

    function addAdmin(data) {
      var deferred = $q.defer();

      dbg.log2('#AccountDatabaseServices > addAdmin > make rest call', data);
      accountDatabaseRestApi.addAdmin.post({ id: data.accountId }, data, function(res) {
        dbg.log2('#AccountDatabaseServices > addAdmin > rest call responds');
        deferred.resolve(res);
      });

      return deferred.promise;
    };

    function remAdmin(data) {
      var deferred = $q.defer();

      dbg.log2('#AccountDatabaseServices > remAdmin > make rest call', data);
      accountDatabaseRestApi.remAdmin.post({ id: data.accountId }, data, function(res) {
        dbg.log2('#AccountDatabaseServices > remAdmin > rest call responds');
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
