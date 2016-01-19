(function () {
  'use strict';

  angular.module('KliikoApp').
    controller('UpgradePlanController', UpgradePlanController);

  UpgradePlanController.$inject = ['dbg', 'domServices', '$state', '$stateParams', 'upgradePlanServices', 'user', 'ngProgressFactory', '$scope', 'messenger',  '$rootScope'];
  function UpgradePlanController(dbg, domServices, $state, $stateParams, upgradePlanServices, user, ngProgressFactory, $scope, messenger, $rootScope) {
    dbg.log2('#UpgradePlanController  started');
    var vm = this;

    var modalTplPath = 'js/ngApp/components/dashboard-accountProfile-upgradePlan/tpls/';
    var selectedPaymentMethod, step2IsValid;

    // set first step for 5 steps checkout process
    $stateParams.planUpgradeStep = 1;

    vm.currentStep = $stateParams.planUpgradeStep;
    vm.$state = $state;
    vm.cantMoveNextStep = false;
    vm.modContentBlock = {selectedPlanDetails: true};
    vm.updateBtn = 'Update';
    vm.upgradeDuration = 1;
    vm.finalPrice = 0 ;

    vm.incorrectPromocode = null;
    vm.promocodeData = null;

    vm.paymentDetails = {
      chargebee: {
        selected: false,
        tos: false
      },
      changePaymentMethodTo: changePaymentMethodTo
    };

    vm.canUpgradeTo = canUpgradeTo;
    vm.stepsClassIsActive = stepsClassIsActive;
    vm.stepsClassIsDone = stepsClassIsDone;
    vm.openPlanDetailsModal = openPlanDetailsModal;
    vm.upgradeToPlan = upgradeToPlan;
    vm.updateUserData = updateUserData;
    vm.goToStep = goToStep;
    vm.handleUserDataChangeClick = handleUserDataChangeClick;
    vm.updateFinalPrice = updateFinalPrice;
    vm.handleTosCheck = handleTosCheck;

    init();

    function init() {

      upgradePlanServices.init().then(fetchInitData);

      function fetchInitData() {
        // get all plans details
        var progressbarForPlans = ngProgressFactory.createInstance();
        progressbarForPlans.start();
        upgradePlanServices.getPlans().then(function (res) {
          dbg.log2('#UpgradePlanController > fetchInitData > plans fetched');
          progressbarForPlans.complete();

          vm.plans = res
        });

        // get all data for current user
        var progressbarForUserData = ngProgressFactory.createInstance();
        progressbarForUserData.start();
        user.getUserData().then(function (res) {
          dbg.log2('#UpgradePlanController > fetchInitData > userData fetched');
          progressbarForUserData.complete();

          vm.userData = res;
        });
      }

      // after payment callback url case
      if ($stateParams.step && $stateParams.step == 5)  { goToStep(5) }
    }

    /**
     * Hide downgrade options
     * @param planNumber {'plan1' || 'plan2'}
     * @returns {boolean}
     */
    function canUpgradeTo(planNumber) {
      if (!vm.userData || !vm.userData.subscriptions) return true;

      if (planNumber === 'plan1') {
        if (vm.userData.subscriptions.planId == 'plan1' || vm.userData.subscriptions.planId == 'plan2' ) return false;
      }

      if (planNumber === 'plan2') {
        if ( vm.userData.subscriptions.planId == 'plan2' ) return false;
      }

      return true
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
      vm.currentPlan = vm.plans[plan];
      vm.currentPlanModalContentTpl = modalTplPath + vm.currentPlan.id + '.tpl.html';

      domServices.modal('plansModal');
    }

    /**
     * Proceed with selected plan upgrade steps
     * @param plan {string}
     */
    function upgradeToPlan(plan) {
      dbg.log('#UpgradePlanController > Upgrade to plan >', plan);

      vm.selectedPlan = vm.plans[plan];
      vm.finalPrice = vm.selectedPlan.price;

      domServices.modal('plansModal', 'close');


      goToStep(2);


    }


    function goToStep(step) {
      if (!angular.isNumber(step)) {
        if (step === 'back') { step = vm.currentStep - 1; vm.cantMoveNextStep = false; }
        if (step === 'next') { step = vm.currentStep + 1 }
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
     * @param step {number}
     * @returns {boolean}
     */
    function validateStep(step) {
      if (step === 3) { return validateStep2() }
      if (step === 4) { return validateStep3() }

      return true;

      function validateStep2() {
        if (step2IsValid) {
          vm.cantMoveNextStep = true;
          return true;
        }
        if (!vm.promocode || !vm.promocode.length) {
          vm.cantMoveNextStep = true;
          return true;
        }

        upgradePlanServices.validatePromocode(vm.promocode).then(
          function(res) {
            vm.incorrectPromocode = null;
            step2IsValid =  true; goToStep(3);
            vm.promocodeData = res;
            calculateDiscount();
          },
          function(err) {
            messenger.error('Incorrect Promotional Code');
            vm.incorrectPromocode = true;
            return false;
          }
        );

      }

      function validateStep3() {
        if (vm.cantMoveNextStep) {
          domServices.shakeClass('terms-attention');
          return false;
        }
        return true;
      }
    }

    function updateUserData(data, form) {
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
      if (type === 'chargebee') vm.paymentDetails.chargebee.selected = true;

      selectedPaymentMethod = type;

      // forbid to press next if TOS are not checked
      $scope.$watch(function () {  return vm.paymentDetails[type].tos;  },function(value) {
        vm.cantMoveNextStep = !value;
      });

    }

    function handleUserDataChangeClick() {
      domServices.modal('contactDetailsModal');
      $('#contactDetailsModal').on('hide.bs.modal', function (e) {
        init();
      });
    }

    function updateFinalPrice() {
      vm.finalPrice = vm.selectedPlan.price  * vm.upgradeDuration;
      vm.orderTotal = vm.finalPrice;
    }


    function calculateDiscount() {
      vm.discount = upgradePlanServices.calculateDiscount(vm.finalPrice);
      vm.orderTotal = vm.finalPrice - vm.discount;
    }

    function handleTosCheck() {
      vm.cantMoveNextStep = !vm.paymentDetails.chargebee.tos;
    }

    function submitUpgrade() {
      dbg.log2('#UpgradePlanControllerAppController > submitUpgrade ');

      var progressbar = ngProgressFactory.createInstance();
      progressbar.start();

      var planObject = {
        plan: vm.selectedPlan,
        duration: vm.upgradeDuration
      };

      var paymentObject = {
        paymentMethod: selectedPaymentMethod,
        promocode: vm.promocode,
        currency: 'USD',
        totalPrice: vm.finalPrice
      };

      domServices.showFader();

      upgradePlanServices.submitUpgrade(planObject, paymentObject, vm.userData).then(
        function(res) {
          dbg.log2('#UpgradePlanControllerAppController > submitUpgrade > success ');


          if (res.hosted_page)  {
            // case of new subscription. go to prepared hosted page;
            window.location = res.hosted_page.url;
            return;
          } else {
            // case when subscription is aupdated
            $rootScope.$emit('app.updateUser');
            progressbar.complete();
            goToStep(5);
            domServices.hideFader();
            vm.paymentSubmitSuccess = true;
          }



        },
        function(err) {
          dbg.log2('#UpgradePlanControllerAppController > submitUpgrade > error: ', err);

          progressbar.complete();
          goToStep(5);
          domServices.hideFader();

          messenger.error('Submitting Failed: '+ err);

          vm.cantMoveNextStep = true;
          vm.paymentSubmitSuccess = null;
          vm.paymentSubmitError = err.error_msg;
        }
      );
    }

  }


})();