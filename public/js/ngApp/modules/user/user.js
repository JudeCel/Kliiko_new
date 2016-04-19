(function () {
  'use strict';
  angular.module('KliikoApp.user', []).factory('user', usersFactory);

  usersFactory.$inject = ['$q', 'globalSettings', '$resource', 'dbg'];
  function usersFactory($q, globalSettings, $resource, dbg) {
    var user = {};
    var usersRestApi = $resource(globalSettings.restUrl + '/user', {}, {post: {method: 'POST'}, changePassword: {method: 'PUT'}});

    var UserService = {};
    UserService.getUserData = getUserData;
    UserService.changeUserPassword = changeUserPassword;
    return UserService;

    function getUserData(forceUpdate) {
      dbg.log2('#KliikoApp.user > get user');
      var deferred = $q.defer();

      usersRestApi.get({}, function (res) {
        dbg.log2('#KliikoApp.user > get user > server respond >', res);

        if(res.error) {
          deferred.reject(res.error);
        }
        else {
          user = res;
          deferred.resolve(user);
        }
      });

      return deferred.promise;
    }

    function changeUserPassword(data){
      var deferred = $q.defer();

      usersRestApi.changePassword(data, function(res) {
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
