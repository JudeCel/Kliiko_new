(function () {
  'use strict';
  angular.module('KliikoApp.user', []).factory('user', usersFactory);

  usersFactory.$inject = ['$q', 'globalSettings', '$resource', 'dbg'];
  function usersFactory($q, globalSettings, $resource, dbg) {
    var vm = this;
    vm.user = {};
    var usersRestApi = $resource(globalSettings.restUrl + '/user', {}, {post: {method: 'POST'}, changePassword: {method: 'PUT'}});

    var UserService = {};
    UserService.getUserData = getUserData;
    UserService.changeUserPassword = changeUserPassword;
    UserService.updateUserData = updateUserData;
    return UserService;

    function getUserData(app) {
      vm.app = app;
      dbg.log2('#KliikoApp.user > get user');
      var deferred = $q.defer();

      usersRestApi.get({}, function (res) {
        dbg.log2('#KliikoApp.user > get user > server respond >', res);

        if(res.error) {
          deferred.reject(res.error);
        }
        else {
          vm.user = res;
          deferred.resolve(vm.user);
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
          vm.app.user = res;
          deferred.resolve(res);
        }
      });

      return deferred.promise;
    }
  }
})();
