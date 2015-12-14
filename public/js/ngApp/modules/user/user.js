(function () {
    'use strict';

    angular.module('KliikoApp.user', []).factory('user', usersFactory);

    usersFactory.$inject = ['$q','globalSettings', '$resource', 'dbg'];
    function usersFactory($q,globalSettings, $resource, dbg)  {
        var user = {};

        var usersRestApi = {
            user: $resource(globalSettings.restUrl+'/user', {}, {post: {method: 'POST'} }),
        };

        var UserService = {};

        UserService.getUserData = getUserData;
        UserService.updateUserData = updateUserData;

        return UserService;

        function getUserData() {
            dbg.log2('KliikoApp.user > get all user details');
            var deferred = $q.defer();

            if (user && user.id) {
                dbg.log2('KliikoApp.user > get all user details > return cached value');
                deferred.resolve(user);
                return deferred.promise;

            }
            dbg.log2('KliikoApp.user > get all user details > will return value from server');
            usersRestApi.user.get({}, function(res) {
                dbg.log2('KliikoApp.user > get all user details > server respond >', res);

                //cache this data
                user = res;

                deferred.resolve(res);
            });

            return deferred.promise;

            return
        }

        /**
         * Update and save in db and memory cache all user data
         * @param data {object} - user form object
         */
        function updateUserData(data) {
            var deferred = $q.defer();

            usersRestApi.user.post(data, function(res) {
                if (!res.error) user = res;
                deferred.resolve();
            });


            return deferred.promise;

        }
    }


})();

