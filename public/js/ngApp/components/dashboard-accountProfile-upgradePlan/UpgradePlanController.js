(function () {
    'use strict';

    angular.
    module('KliikoApp').
    controller('UpgradePlanController', UpgradePlanController);

    UpgradePlanController.$inject = ['dbg', 'domServices', '$state', 'upgradePlanServices', '$scope'];
    function UpgradePlanController(dbg, domServices, $state, upgradePlanServices, $scope) {
        dbg.log2('#UpgradePlanController  started');
        var vm = this;

        var modalTplPath = 'js/ngApp/components/dashboard-accountProfile-upgradePlan/tpls/';


        vm.currentStep = 1;
        vm.$state = $state;
        vm.modContentBlock = {};

        vm.openPlanDetailsModal = openPlanDetailsModal;
        vm.upgradeToPlan = upgradeToPlan;
        vm.applyCountryAndCurrency = applyCountryAndCurrency;


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
                    var tmp = res;
                    delete tmp.all;
                    vm.currencies = tmp;
                    vm.selectedCurrency = vm.currencies[vm.selectedCountry.currencies[0]];

                    dbg.log2('#UpgradePlanController > getAllCurrenciesList > res ', res);

                    $scope.$watch("up.selectedCountry",function(value){
                        vm.selectedCurrency = vm.currencies[vm.selectedCountry.currencies[0]];
                    });

                });

            });




        }

        function applyCountryAndCurrency() {
            console.log(vm.selectedCountry, vm.selectedCurrency);
        }

    }


})();