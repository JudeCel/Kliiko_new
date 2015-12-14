(function () {
    'use strict';

    angular.
    module('KliikoApp').
    controller('UpgradePlanController', UpgradePlanController);

    UpgradePlanController.$inject = ['dbg', 'domServices', '$state', '$stateParams','upgradePlanServices', '$scope', '$rootScope', 'user'];
    function UpgradePlanController(dbg, domServices, $state,$stateParams, upgradePlanServices, $scope, $rootScope, user) {
        dbg.log2('#UpgradePlanController  started');
        var vm = this;

        var modalTplPath = 'js/ngApp/components/dashboard-accountProfile-upgradePlan/tpls/';

        $stateParams.planUpgradeStep = 1;
        vm.currentStep = $stateParams.planUpgradeStep;
        vm.$state = $state;
        vm.modContentBlock = {selectedPlanDetails:true};

        vm.openPlanDetailsModal = openPlanDetailsModal;
        vm.upgradeToPlan = upgradeToPlan;
        vm.applyCountryAndCurrency = applyCountryAndCurrency;
        vm.getUserData = getUserData;
        vm.updateUserData = updateUserData;

        init();

        function init() {
            // get all plans details
            upgradePlanServices.getPlans().then(function(res) { vm.plans = res });

            // get countries and currencies with exchange rates
            upgradePlanServices.getAllCountriesList().then(function(res) {
                dbg.log2('#UpgradePlanController > getAllCountriesList > res ', res);
                vm.countries = res.all;

                // then go and get currencies and exchange rates
                dbg.log2('#UpgradePlanController > getAllCurrenciesList > call');
                upgradePlanServices.getAllCurrenciesList().then(function(res) {
                    vm.currencies = res;
                    dbg.log2('#UpgradePlanController > getAllCurrenciesList > res ', res);
                });

            });
        }

        /**
         * Open plan upgrade modal with particular plan information
         * @param plan {string}
         */
        function openPlanDetailsModal(plan) {
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

            vm.selectedPlanName = plan;

            domServices.modal('plansModal', 'close');


            dbg.log2('#UpgradePlanController > getAllCountriesList > call');
            upgradePlanServices.getAllCountriesList().then(function(res) {
                dbg.log2('#UpgradePlanController > getAllCountriesList > res ', res);
                vm.countries = res.all;
                vm.selectedCountry = vm.countries[13];
                domServices.modal('countryAndCurrencySelect');


                // then go and get currencies
                dbg.log2('#UpgradePlanController > getAllCurrenciesList > call');
                upgradePlanServices.getAllCurrenciesList().then(function(res) {
                    //remove 'all' array and show only popular
                    vm.currencies = res;
                    vm.selectedCurrency = vm.currencies[vm.selectedCountry.currencies[0]];

                    dbg.log2('#UpgradePlanController > getAllCurrenciesList > res ', res);

                    $scope.$watch("up.selectedCountry",function(value){
                        vm.selectedCurrency = vm.currencies[vm.selectedCountry.currencies[0]];
                    });

                });

            });


        }

        function applyCountryAndCurrency() {
            dbg.log2('UpgradePlanController > Country and currency are selected > ', vm.selectedCountry, vm.selectedCurrency)

            domServices.modal('countryAndCurrencySelect', 'close');
            goToStep(2);

        }

        function goToStep(step) {
            $stateParams.planUpgradeStep = vm.currentStep = step;

        }

        function getUserData(collapsed) {
            if (collapsed || (vm.userData && vm.userData.updatedAt) ) return;
            user.getUserData().then(function(res) {
                vm.userData = res;
            });
        }

        function updateUserData(data) {
            user.updateUserData(data);
        }

    }


})();