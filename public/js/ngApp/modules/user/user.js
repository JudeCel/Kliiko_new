(function () {
    'use strict';

    angular.module('KliikoApp.user', []).factory('user', usersFactory);

    usersFactory.$inject = ['$q','globalSettings', '$resource', 'dbg'];
    function usersFactory($q,globalSettings, $resource, dbg)  {
        var user = {};
        var canAccessCache = {};

        var usersRestApi = {
          userCanAccess: $resource(globalSettings.restUrl+'/user/canAccess', {}, {post: {method: 'POST'} }),
          user: $resource(globalSettings.restUrl+'/user', {}, {post: {method: 'POST'} }),

        };

        var UserService = {};

        UserService.getUserData = getUserData;
        UserService.updateUserData = updateUserData;
        UserService.canAccess = canAccess;

        return UserService;

        function getUserData() {
            dbg.log2('#KliikoApp.user > get all user details');
            var deferred = $q.defer();

            if (user && user.id) {
                dbg.log2('#KliikoApp.user > get all user details > return cached value');
                deferred.resolve(user);
                return deferred.promise;

            }
            dbg.log2('#KliikoApp.user > get all user details > will return value from server');
            usersRestApi.user.get({}, function(res) {
                dbg.log2('#KliikoApp.user > get all user details > server respond >', res);

                //cache this data
                user = res;

                deferred.resolve(res);
            });

            return deferred.promise;

        }

        /**
         * Update and save in db and memory cache all user data
         * @param data {object} - user form object
         */
        function updateUserData(data) {
            var deferred = $q.defer();

            usersRestApi.user.post(data, function(res) {
                if (res.error) { deferred.reject(res.error); return deferred.promise; }
                user = res;
                deferred.resolve();
            });


            return deferred.promise;

        }

        function canAccess(section) {
            var deferred = $q.defer();

            if (!section) {
                dbg.error('#KliikoApp.user > canAccess > no @section param is provided');
                deferred.reject({error:'no @section param is provided'});
                return deferred.promise;
            }

            // return cached value
            if (canAccessCache[section]) {
              deferred.resolve();
              return deferred.promise;
            }

            usersRestApi.userCanAccess.post({},{section: section}, function(res) {
              if (!res.accessPermitted) {
                canAccessCache[section] = false;
                deferred.reject(res);
                return deferred.promise;
              }
              canAccessCache[section] = true;
              deferred.resolve(res);
            });

            return deferred.promise;

        }
    }


})();

