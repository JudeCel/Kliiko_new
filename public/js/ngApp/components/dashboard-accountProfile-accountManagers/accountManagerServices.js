(function () {
  'use strict';
  angular.module('KliikoApp').factory('accountManagerServices', accountManagerServices);
  accountManagerServices.$inject = ['globalSettings', '$q', '$resource', 'dbg'];

  function accountManagerServices(globalSettings, $q, $resource, dbg) {
    var accountManagerRestApi = $resource(globalSettings.restUrl + '/accountManager/:path', null, {
      update: { method: 'PUT' },
      deleteAccountUser: { method: 'DELETE', params: { path: 'accountUser' } },
      canAddAccountManager: { method: 'GET', params: { path: 'canAddAccountManager' } }
    });

    var upServices = {};

    upServices.getAllManagersList = getAllManagersList;
    upServices.createAccountManager = createAccountManager;
    upServices.removeInvite = removeInvite;
    upServices.removeAccountUser = removeAccountUser;
    upServices.editAccountManager = editAccountManager;
    upServices.canAddAccountManager = canAddAccountManager;
    return upServices;

    function getAllManagersList() {
      var deferred = $q.defer();

      dbg.log2('#AccountManagerServices > getAllManagersList > make rest call');
      accountManagerRestApi.get( function(res) {
        dbg.log2('#AccountManagerServices > getAllManagersList > rest call responds');
        deferred.resolve(res);
      });

      return deferred.promise;
    };

    function canAddAccountManager() {
      var deferred = $q.defer();

      dbg.log2('#AccountManagerServices > canAddAccountManager > make rest call');
      accountManagerRestApi.canAddAccountManager({}, function(res) {
        dbg.log2('#AccountManagerServices > canAddAccountManager > rest call responds');
        deferred.resolve(res);
      });

      return deferred.promise;
    }

    function createAccountManager(data) {
      var deferred = $q.defer();

      dbg.log2('#AccountManagerServices > createAccountManager > make rest call');
      accountManagerRestApi.save(data, function(res) {
        dbg.log2('#AccountManagerServices > createAccountManager > rest call responds');
        deferred.resolve(res);
      });

      return deferred.promise;
    };

    function editAccountManager(data) {
      var deferred = $q.defer();

      dbg.log2('#AccountManagerServices > editAccountManager > make rest call', data);
      accountManagerRestApi.update(data, function(res) {
        dbg.log2('#AccountManagerServices > editAccountManager > rest call responds');
        deferred.resolve(res);
      });

      return deferred.promise;
    }

    function removeInvite(data) {
      var deferred = $q.defer();
      dbg.log2('#AccountManagerServices > removeInvite > make rest call');
      accountManagerRestApi.delete(data, function(res) {
        dbg.log2('#AccountManagerServices > removeInvite > rest call responds');
        deferred.resolve(res);
      });

      return deferred.promise;
    };

    function removeAccountUser(data) {
      var deferred = $q.defer();

      dbg.log2('#AccountManagerServices > removeAccountUser > make rest call', data);
      accountManagerRestApi.deleteAccountUser(data, function(res) {
        dbg.log2('#AccountManagerServices > removeAccountUser > rest call responds');
        deferred.resolve(res);
      });

      return deferred.promise;
    };
  };
})();
