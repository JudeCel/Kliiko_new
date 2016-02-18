(function () {
  'use strict';

  angular.module('KliikoApp').controller('SessionBuilderController', SessionBuilderController);

  SessionBuilderController.$inject = ['dbg', 'messenger', 'SessionModel','$state', '$stateParams'];
  function SessionBuilderController(dbg, messenger, SessionModel, $state, $stateParams) {
    dbg.log2('#SessionBuilderController started');

    var vm = this;

    var sessionId = $stateParams.id || null;

    vm.session = new SessionModel(sessionId);

    vm.accordions = {};
    vm.basePath = '/js/ngApp/components/dashboard-chatSessions-builder/';
    //vm.currentStep = $stateParams.currentStep;
    vm.currentStep = 1;
    vm.$state = $state;

    vm.closeSession = closeSession;
    vm.stepsClassIsActive = stepsClassIsActive;
    vm.updateStep = updateStep;
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
      return true;
      if (step === 3) { return validateStep2() }
      if (step === 4) { return validateStep3() }

      return true;

      function validateStep2() {
        return true;
      }

      function validateStep3() {
        return true;
      }
    }

    function stepsClassIsActive(step) {
      return (vm.currentStep == step);
    }

    function updateStep() {
      vm.session.updateStep();
    }

  }
})();
