(function () {
  'use strict';
  angular.module('KliikoApp').factory('accountManagerServices', accountManagerServices);
  accountManagerServices.$inject = ['globalSettings', '$q', '$resource', 'dbg'];

  function accountManagerServices(globalSettings, $q, $resource, dbg) {
    var accountManagerRestApi = {
      accountManager: $resource(globalSettings.restUrl +'/accountManager', {}, { post: { method: 'POST' } }),
      removeAccountUser: $resource(globalSettings.restUrl +'/accountManager/accountUser', {}, { post: { method: 'POST' } }),
      removeInvite: $resource(globalSettings.restUrl +'/invite', {}, { post: { method: 'POST' } })
    };

    var upServices = {};

    upServices.getAllManagersList = getAllManagersList;
    upServices.createAccountManager = createAccountManager;
    upServices.removeInvite = removeInvite;
    upServices.removeAccountUser = removeAccountUser;
    return upServices;

    function getAllManagersList() {
      var deferred = $q.defer();

      dbg.log2('#AccountManagerServices > getAllManagersList > make rest call');
      accountManagerRestApi.accountManager.get({}, function(res) {
        dbg.log2('#AccountManagerServices > getAllManagersList > rest call responds');
        deferred.resolve(res);
      });

      return deferred.promise;
    };

    function createAccountManager(data) {
      var deferred = $q.defer();

      dbg.log2('#AccountManagerServices > createAccountManager > make rest call', data);
      accountManagerRestApi.accountManager.save(data, function(res) {
        dbg.log2('#AccountManagerServices > createAccountManager > rest call responds');
        deferred.resolve(res);
      });

      return deferred.promise;
    };

    function removeInvite(data) {
      var deferred = $q.defer();
      dbg.log2('#AccountManagerServices > removeInvite > make rest call', data);
      accountManagerRestApi.removeInvite.delete(data, function(res) {
        dbg.log2('#AccountManagerServices > removeInvite > rest call responds');
        deferred.resolve(res);
      });

      return deferred.promise;
    };

    function removeAccountUser(data) {
      var deferred = $q.defer();

      dbg.log2('#AccountManagerServices > removeAccountUser > make rest call', data);
      accountManagerRestApi.removeAccountUser.delete(data, function(res) {
        dbg.log2('#AccountManagerServices > removeAccountUser > rest call responds');
        deferred.resolve(res);
      });

      return deferred.promise;
    };
  };
})();
