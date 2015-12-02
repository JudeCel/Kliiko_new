(function () {
    'use strict';

    angular.
    module('KliikoApp').
    controller('Dashboard', DashboardController);

    DashboardController.$inject = ['dbg','$state', '$rootScope'];
    function DashboardController(dbg, $state, $rootScope) {
        dbg.log2('#Dashboard controller started');

        var vm = this;

        vm.tst = 'tst';

        $rootScope.aaa = 4343;

    }


})();