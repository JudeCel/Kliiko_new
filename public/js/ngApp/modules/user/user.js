(function () {
  'use strict';
  angular.module('KliikoApp.user', []).factory('user', usersFactory);

  usersFactory.$inject = ['$q', 'globalSettings', '$resource', 'dbg'];
  function usersFactory($q, globalSettings, $resource, dbg) {
    var usersRestApi = $resource(globalSettings.restUrl + '/user', {}, {post: {method: 'POST'}, changePassword: {method: 'PUT'}});

    var UserService = {};
    UserService.app = {};
    UserService.user = {};
    UserService.getUserData = getUserData;
    UserService.changeUserPassword = changeUserPassword;
    UserService.updateUserData = updateUserData;
    return UserService;

    function getUserData(app) {
      UserService.app = app;
      dbg.log2('#KliikoApp.user > get user');
      var deferred = $q.defer();

      usersRestApi.get({}, function (res) {
        dbg.log2('#KliikoApp.user > get user > server respond >', res);

        if(res.error) {
          deferred.reject(res.error);
        }
        else {
          $('#welcome-user').removeClass('hidden');
          UserService.user = res;
          deferred.resolve(UserService.user);
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

    function updateUserData(data) {
      var deferred = $q.defer();

      usersRestApi.post(data, function (res) {
        if(res.error) {
          deferred.reject(res.error);
        }
        else {
          UserService.app.user = res.user;
          UserService.user = res.user;
          deferred.resolve(res);
        }
      });

      return deferred.promise;
    }
  }
})();
