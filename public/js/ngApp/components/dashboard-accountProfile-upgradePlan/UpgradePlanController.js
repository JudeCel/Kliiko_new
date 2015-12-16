(function () {
  'use strict';

  angular.
  module('KliikoApp').
  controller('UpgradePlanController', UpgradePlanController);

  UpgradePlanController.$inject = ['dbg', 'domServices', '$state', '$stateParams', 'upgradePlanServices', '$scope', '$rootScope', 'user'];
  function UpgradePlanController(dbg, domServices, $state, $stateParams, upgradePlanServices, $scope, $rootScope, user) {
    dbg.log2('#UpgradePlanController  started');
    var vm = this;

    var modalTplPath = 'js/ngApp/components/dashboard-accountProfile-upgradePlan/tpls/';
    var selectedPaymentMethod;

    // set first step for 5 steps checkout process
    $stateParams.planUpgradeStep = 1;

    vm.currentStep = $stateParams.planUpgradeStep;
    vm.$state = $state;
    vm.modContentBlock = {selectedPlanDetails: true};
    vm.updateBtn = 'Update';
    vm.upgradeDuration = 1;
    vm.expDates = {
      years: upgradePlanServices.getYearsArray(),
      days: upgradePlanServices.getDaysArray()
    };

    vm.paymentDetails = {
      payPal: {
        selected: false,
        tos: false,
      },
      creditCard: {
        number: null,
        selected: false,
        tos: false,
        numberChanged: cardNumberChanged
      },

      changePaymentMethodTo: changePaymentMethodTo
    };

    vm.stepsClassIsActive = stepsClassIsActive;
    vm.stepsClassIsDone = stepsClassIsDone;
    vm.openPlanDetailsModal = openPlanDetailsModal;
    vm.upgradeToPlan = upgradeToPlan;
    vm.applyCountryAndCurrency = applyCountryAndCurrency;
    //vm.getUserData = getUserData;
    vm.updateUserData = updateUserData;
    vm.goToStep = goToStep;

    init();

    function init() {
      // get all plans details
      upgradePlanServices.getPlans().then(function (res) {
        vm.plans = res
      });

      // get countries and currencies with exchange rates
      upgradePlanServices.getAllCountriesList().then(function (res) {
        dbg.log2('#UpgradePlanController > getAllCountriesList > res ', res);
        vm.countries = res.all;

        // then go and get currencies and exchange rates
        dbg.log2('#UpgradePlanController > getAllCurrenciesList > call');
        upgradePlanServices.getAllCurrenciesList().then(function (res) {
          vm.currencies = res;
          dbg.log2('#UpgradePlanController > getAllCurrenciesList > res ', res);
        });

      });

      user.getUserData().then(function (res) {
        vm.userData = res;
      });
    }

    /**
     * Helpers for ng-class
     * @param step {int || char}
     * @returns {boolean}
     */
    function stepsClassIsActive(step) {
      return (vm.currentStep == step);
    }

    function stepsClassIsDone(step) {
      return (vm.currentStep > step);
    }


    /**
     * Open plan upgrade modal with particular plan information
     * @param plan {string}
     */
    function openPlanDetailsModal(plan) {
      vm.currentPlan = plan;
      vm.currentPlanModalContentTpl = modalTplPath + vm.currentPlan + '-plan.tpl.html';

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
      upgradePlanServices.getAllCountriesList().then(function (res) {
        dbg.log2('#UpgradePlanController > getAllCountriesList > res ', res);
        vm.countries = res.all;
        vm.selectedCountry = vm.countries[13];
        domServices.modal('countryAndCurrencySelect');


        // then go and get currencies
        dbg.log2('#UpgradePlanController > getAllCurrenciesList > call');
        upgradePlanServices.getAllCurrenciesList().then(function (res) {
          //remove 'all' array and show only popular
          vm.currencies = res;
          vm.selectedCurrency = vm.currencies[vm.selectedCountry.currencies[0]];

          dbg.log2('#UpgradePlanController > getAllCurrenciesList > res ', res);

          $scope.$watch("up.selectedCountry", function (value) {
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
      if (!angular.isNumber(step)) {
        if (step === 'back') step = vm.currentStep - 1;
        if (step === 'next') step = vm.currentStep + 1;
        if (step === 'submit') {
          step = 5;
          submitUpgrade()
        }
      }

      var valid = validateStep(step);

      if (!valid) return;

      $stateParams.planUpgradeStep = vm.currentStep = step;

    }

    function validateStep(step) {
      if (step === 3) return validateStep2();

      return true;

      function validateStep2() {
        // temporary solution
        return true;
      }
    }

    function updateUserData(data, form) {

      //vm.updateBtn = 'Updating...';
      user.updateUserData(data).then(function (res) {
        vm.updateBtn = 'Updated';
        setTimeout(function () {
          form.$setPristine();
          form.$setUntouched();
        }, 2000);


      });
    }

    function changePaymentMethodTo(type) {
      if (type === 'payPal') {
        vm.paymentDetails.payPal.selected = true;
        vm.paymentDetails.payPal.tos = false;
        vm.paymentDetails.creditCard.selected = false;
      } else {
        vm.paymentDetails.creditCard.selected = true;
        vm.paymentDetails.creditCard.tos = false;
        vm.paymentDetails.payPal.selected = false;
      }

      selectedPaymentMethod = type;
    }

    function cardNumberChanged() {
      vm.paymentDetails.creditCard.number = upgradePlanServices.formatCreditCardNumber(vm.paymentDetails.creditCard.number);
    }

    function submitUpgrade() {
      var planObject = {
        plan: vm.plans[vm.selectedPlanName],
        duration: vm.upgradeDuration
      };

      var paymentObject = {
        paymentMethod: selectedPaymentMethod,
        promocode: vm.promocode,
        currency: vm.selectedCurrency.code,
        totalPrice: vm.finalPrice
      };

      if (vm.paymentDetails.creditCard.selected) {
        paymentObject.creditcardDetails = {
          cardHolderName: vm.paymentDetails.creditCard.holderName,
          cardNumber: vm.paymentDetails.creditCard.number.replace(/\D/g, ''),
          expDate: vm.paymentDetails.creditCard.expDate,
          expYear: vm.paymentDetails.creditCard.expYear,
          cvv: vm.paymentDetails.creditCard.cvv
        }
      }

      upgradePlanServices.submitUpgrade(planObject, paymentObject)
    }

  }


})();