(function () {
  'use strict';

  angular.module('KliikoApp.account', []).factory('account', accountFactory);

  accountFactory.$inject = ['$q', 'globalSettings', '$resource', 'dbg'];
  function accountFactory($q, globalSettings, $resource, dbg) {

    var accountRestApi = $resource('/account', {}, {post: {method: 'POST'}});

    var UserService = {};
    UserService.createNewAccount = createNewAccount;
    UserService.account = {};
    return UserService;
    
    function createNewAccount(data) {
      var deferred = $q.defer();

      accountRestApi.post(data, function (res) {
        if (res.error) {
          deferred.reject(res.error);
        } else {
          deferred.resolve(res);
        }
      });

      return deferred.promise;
    };
  }
})();
