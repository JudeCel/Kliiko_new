(function () {
    'use strict';

    angular.module('domServices', [])
        .factory('domServices', domServicesFactory);

    domServicesFactory.$inject = ['dbg'];
    function domServicesFactory(dbg) {

        var domServicesPublicMethods = {};
        domServicesPublicMethods.modal = handleModalActions;


        return domServicesPublicMethods;

        function handleModalActions(modalId, close) {
            var show = true;
            if (close) show = false;

            $('#'+modalId).modal({show:show});
        }


    }


})();
