(function () {
    'use strict';

    angular.module('domServices', [])
        .factory('domServices', domServicesFactory);

    domServicesFactory.$inject = ['dbg'];
    function domServicesFactory(dbg) {

        var domServicesPublicMethods = {};
        domServicesPublicMethods.modal = handleModalActions;


        return domServicesPublicMethods;

        /**
         * Open or close selected @modalId modal window
         * @param modalId {string}
         * @param [close] {boolean}
         */
        function handleModalActions(modalId, close) {
            close
                ? jQuery('#'+modalId).modal('hide')
                : jQuery('#'+modalId).modal('show');
        }

    }


})();
