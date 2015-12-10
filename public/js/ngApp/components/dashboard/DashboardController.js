(function () {
    'use strict';

    angular.
    module('KliikoApp').
    controller('DashboardController', DashboardController);

    DashboardController.$inject = ['dbg', '$state', '$stateParams'];
    function DashboardController(dbg, $state, $stateParams) {
        dbg.log2('#Dashboard controller started');

        var vm = this;

        vm.$state = $state;

        vm.handleBackBtn = handleBackBtn;

        function handleBackBtn() {
            console.log($state.current, $stateParams);
            if ($stateParams.step && $stateParams.step > 1) {
                $stateParams.step = $stateParams.step - 1;
            }
            //if ($state.current.name == 'dashboard.accountProfile.upgradePlan') {
            //    $state.go('dashboard.accountProfile');
            //    //setTimeout(function() { $rootScope.$apply()  }, 10);
            //    //console.log();
            //
            //}
        }
    }


})();