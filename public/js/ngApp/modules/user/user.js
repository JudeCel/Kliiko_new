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
            return usersRestApi.user.get();
        }

        function updateUserData(data) {
            return usersRestApi.user.post(data);
        }
    }


})();

