(function () {
  'use strict';

  angular.
  module('KliikoApp').
  controller('UpgradePlanController', UpgradePlanController);

  UpgradePlanController.$inject = ['dbg', 'domServices', '$state', '$stateParams', 'upgradePlanServices', 'user', 'ngProgressFactory', '$scope', '$sce'];
  function UpgradePlanController(dbg, domServices, $state, $stateParams, upgradePlanServices, user, ngProgressFactory, $scope, $sce) {
    dbg.log2('#UpgradePlanController  started');
    var vm = this;

    var modalTplPath = 'js/ngApp/components/dashboard-accountProfile-upgradePlan/tpls/';
    var selectedPaymentMethod;

    // set first step for 5 steps checkout process
    $stateParams.planUpgradeStep = 1;

    vm.currentStep = $stateParams.planUpgradeStep;
    vm.$state = $state;
    vm.cantMoveNextStep = false;
    vm.modContentBlock = {selectedPlanDetails: true};
    vm.updateBtn = 'Update';
    vm.upgradeDuration = 1;
    vm.expDates = {
      years: upgradePlanServices.getYearsArray(),
      months: upgradePlanServices.getMonthsArray()
    };

    vm.paymentDetails = {
      payPal: {
        selected: false,
        tos: false
      },
      creditCard: {
        number: null,
        selected: false,
        tos: false,
        numberChanged: cardNumberChanged
      },
      chargebee: {
        selected: false,
        tos: false
      },

      changePaymentMethodTo: changePaymentMethodTo
    };

    vm.stepsClassIsActive = stepsClassIsActive;
    vm.stepsClassIsDone = stepsClassIsDone;
    vm.openPlanDetailsModal = openPlanDetailsModal;
    vm.upgradeToPlan = upgradeToPlan;
    vm.updateUserData = updateUserData;
    vm.goToStep = goToStep;
    vm.cvvValidate = cvvValidate;
    vm.handleUserDataChangeClick = handleUserDataChangeClick;

    init();

    function init() {
      // get all plans details
      upgradePlanServices.getPlans().then(function (res) {
        vm.plans = res
      });

      // get all data for current user
      user.getUserData().then(function (res) {
        vm.userData = res;
      });


      // after payment callback url case
      if ($stateParams.step && $stateParams.step == 5)  goToStep(5);
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

      goToStep(2);


    }


    function goToStep(step) {
      if (!angular.isNumber(step)) {
        if (step === 'back') step = vm.currentStep - 1;
        if (step === 'next') step = vm.currentStep + 1;
        if (step === 'submit') {
          //step = 5;
          submitUpgrade();
          return
        }
      }

      var valid = validateStep(step);

      if (!valid) return;

      $stateParams.planUpgradeStep = vm.currentStep = step;

    }

    /**
     * Validate and process steps data
     * @param step
     * @returns {*}
     */
    function validateStep(step) {
      if (step === 3) return validateStep2();
      if (step === 4) return validateStep3();

      return true;

      function validateStep2() {
        upgradePlanServices.initPaymentModule();
        vm.cantMoveNextStep = true;
        return true;
      }

      function validateStep3() {
        if (vm.cantMoveNextStep) {
          domServices.shakeClass('terms-attention');
          return false;
        }

        //if (vm.paymentDetails.creditCard.number == '4' && appData.mode === 'development') vm.paymentDetails.creditCard.number = '4242424242424242';
        //upgradePlanServices.creditCard.createToken(vm.paymentDetails.creditCard)
        return true;
      }
    }

    function updateUserData(data, form) {

      //vm.updateBtn = 'Updating...';
      user.updateUserData(data).then(function (res) {
        vm.updateBtn = 'Updated';

        //hide 'updated' button in a while
        setTimeout(function () {
          form.$setPristine();
          form.$setUntouched();
        }, 2000);


      });
    }

    function changePaymentMethodTo(type) {
      vm.paymentDetails.payPal.selected = false;
      vm.paymentDetails.payPal.tos = false;
      vm.paymentDetails.creditCard.selected = false;
      vm.paymentDetails.creditCard.tos = false;
      vm.paymentDetails.chargebee.selected = false;
      vm.paymentDetails.chargebee.tos = false;

      if (type === 'payPal') vm.paymentDetails.payPal.selected = true;
      if (type === 'creditCard') { vm.paymentDetails.creditCard.selected = true; upgradePlanServices.creditCard.init(); }
      if (type === 'chargebee') vm.paymentDetails.chargebee.selected = true;


      selectedPaymentMethod = type;

      // forbid to press next if TOS are not checked
      $scope.$watch(function () {  return vm.paymentDetails[type].tos;  },function(value) {
        vm.cantMoveNextStep = !value;
      });

    }

    function cardNumberChanged() {
      vm.paymentDetails.creditCard.number = upgradePlanServices.formatCreditCardNumber(vm.paymentDetails.creditCard.number);
    }

    // allow only digits
    function cvvValidate() {
      vm.paymentDetails.creditCard.cvv = vm.paymentDetails.creditCard.cvv.replace(/\D/g, '');
    }

    function handleUserDataChangeClick() {
      domServices.modal('contactDetailsModal');
      $('#contactDetailsModal').on('hide.bs.modal', function (e) {
        init();
      });
    }


    function submitUpgrade() {
      dbg.log2('#UpgradePlanControllerAppController > submitUpgrade ');

      var progressbar = ngProgressFactory.createInstance();
      progressbar.start();

      var planObject = {
        plan: vm.plans[vm.selectedPlanName],
        duration: vm.upgradeDuration
      };

      var paymentObject = {
        paymentMethod: selectedPaymentMethod,
        promocode: vm.promocode,
        currency: 'USD',
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

      if (vm.paymentDetails.chargebee.selected) {
        domServices.showFader();
      }

      upgradePlanServices.submitUpgrade(planObject, paymentObject, vm.userData).then(
        function(res) {
          dbg.log2('#UpgradePlanControllerAppController > submitUpgrade > success, ', res);
          window.location = res.hosted_page.url;
        },
        function(err) {
          dbg.log2('#UpgradePlanControllerAppController > submitUpgrade > error, ', err);

          progressbar.complete();
          goToStep(5);
          domServices.hideFader();

          vm.cantMoveNextStep = true;
          vm.paymentSubmitSuccess = null;
          vm.paymentSubmitError = err.error_msg;
        }
      );
    }

  }


})();