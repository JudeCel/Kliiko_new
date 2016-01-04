(function () {
  'use strict';
  angular.module('KliikoApp').factory('accountManagerServices', accountManagerServices);
  accountManagerServices.$inject = ['globalSettings', '$q', '$resource', 'dbg'];

  function accountManagerServices(globalSettings, $q, $resource, dbg) {
    var accountManagerRestApi = {
      accountManager: $resource(globalSettings.restUrl +'/accountManager', {}, { post: { method: 'POST' } }),
      removeAccountUser: $resource(globalSettings.restUrl +'/accountManager/accountUser', {}, { post: { method: 'POST' } }),
      removeInvite: $resource(globalSettings.restUrl +'/accountManager/invite', {}, { post: { method: 'POST' } })
    };

    var upServices = {};

    upServices.getAllManagersList = getAllManagersList;
    upServices.createAccountManager = createAccountManager;
    upServices.removeAccountManager = removeAccountManager;
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

    function removeAccountManager(data) {
      var deferred = $q.defer();

      dbg.log2('#AccountManagerServices > removeAccountManager > make rest call', data);
      if(data.type == 'invite') {
        accountManagerRestApi.removeInvite.delete(data, function(res) {
          dbg.log2('#AccountManagerServices > removeAccountManager > rest call responds');
          deferred.resolve(res);
        });
      }
      else if(data.type == 'accountUser') {
        accountManagerRestApi.removeAccountUser.delete(data, function(res) {
          dbg.log2('#AccountManagerServices > removeAccountManager > rest call responds');
          deferred.resolve(res);
        });
      }

      return deferred.promise;
    };
  };
})();
