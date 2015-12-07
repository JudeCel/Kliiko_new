(function () {
    'use strict';

    angular.
    module('KliikoApp').
    controller('DashboardController', DashboardController);

    DashboardController.$inject = ['dbg', '$state'];
    function DashboardController(dbg, $state) {
        dbg.log2('#Dashboard controller started');

        var vm = this;

        vm.$state = $state;
    }


})();