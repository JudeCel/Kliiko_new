(function () {
    'use strict';

    angular.
    module('KliikoApp').
    controller('UpgradePlanController', UpgradePlanController);

    UpgradePlanController.$inject = ['dbg', 'domServices', '$state'];
    function UpgradePlanController(dbg, domServices, $state) {
        dbg.log2('#UpgradePlanController  started');
        var vm = this;

        var modalTplPath = 'js/ngApp/components/dashboard-accountProfile-upgradePlan/tpls/';

        vm.currentStep = 1;
        vm.$state = $state;
        vm.modContentBlock = {};

        vm.openModal = openModal;
        vm.upgradeToPlan = upgradeToPlan;

        /**
         * Open plan upgrade modal with particular plan information
         * @param plan {string}
         */
        function openModal(plan) {
            vm.currentPlan = plan;
            vm.currentPlanModalContentTpl = modalTplPath + vm.currentPlan+'-plan.tpl.html';

            domServices.modal('plansModal');
        }

        /**
         * Proceed with selected plan upgrade steps
         * @param plan {string}
         */
        function upgradeToPlan(plan) {
            dbg.log('#UpgradePlanController > Upgrade to plan >', plan);
        }

    }


})();