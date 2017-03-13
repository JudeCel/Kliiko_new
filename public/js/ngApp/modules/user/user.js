(function () {
  'use strict';
  angular.module('KliikoApp.user', []).factory('user', usersFactory);

  usersFactory.$inject = ['$q', '$resource', 'dbg'];
  function usersFactory($q, $resource, dbg) {
    var usersRestApi = $resource('/user', {}, {post: {method: 'POST'}, changePassword: {method: 'PUT'}, permissions: {method: 'PATCH'}});

    var UserService = {};
    UserService.app = {};
    UserService.account = {};
    UserService.user = {};
    UserService.permissions = {};
    UserService.getUserData = getUserData;
    UserService.changeUserPassword = changeUserPassword;
    UserService.updateUserData = updateUserData;
    UserService.reloadPermissions = reloadPermissions;
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
          UserService.app.user = res.user;
          UserService.app.account = res.account;
          UserService.app.accountUser = res.accountUser;
          UserService.app.permissions = res.perrmissions;
          UserService.app.subscription = res.subscription;

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
        if (res.error) {
          deferred.reject(res.error);
        } else {
          for (var field in res.user) {
            UserService.app.accountUser[field] = res.user[field];
          }
          deferred.resolve(res);
        }
      });

      return deferred.promise;
    }

    function reloadPermissions() {
      var deferred = $q.defer();

      usersRestApi.permissions({}, function (res) {
        if (res.error) {
          deferred.reject(res.error);
        } else {
          UserService.app.permissions = res.permissions;
          deferred.resolve(res);
        }
      });

      return deferred.promise;
    }
  }
})();
