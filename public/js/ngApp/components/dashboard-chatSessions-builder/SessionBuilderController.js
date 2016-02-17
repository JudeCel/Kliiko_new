(function () {
  'use strict';

  angular.module('KliikoApp').controller('SessionBuilderController', SessionBuilderController);

  SessionBuilderController.$inject = ['dbg', 'messenger', 'SessionModel','$state', '$stateParams'];
  function SessionBuilderController(dbg, messenger, SessionModel, $state, $stateParams) {
    dbg.log2('#SessionBuilderController started');

    var vm = this;

    var sessionId = $stateParams.id || null;
    var session = new SessionModel(sessionId);

    vm.basePath = '/js/ngApp/components/dashboard-chatSessions-builder/';
    //vm.currentStep = $stateParams.currentStep;
    vm.currentStep = 1;
    vm.$state = $state;

    vm.closeSession = closeSession;
    vm.stepsClassIsActive = stepsClassIsActive;
    vm.goToStep = goToStep;

    function closeSession() {
      session.cancel();
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
      return true
      if (step === 3) { return validateStep2() }
      if (step === 4) { return validateStep3() }

      return true;

      function validateStep2() {
        if (step2IsValid) {
          vm.cantMoveNextStep = true;
          handleTosCheck();
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

    function stepsClassIsActive(step) {
      return (vm.currentStep == step);
    }

  }
})();
