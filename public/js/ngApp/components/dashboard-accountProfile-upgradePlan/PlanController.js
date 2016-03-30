(function () {
  'use strict';

  angular.module('KliikoApp').
    controller('PlanController', PlanController);

  PlanController.$inject = ['dbg', 'domServices', '$state', '$stateParams', 'planService', 'user', 'ngProgressFactory', '$scope', 'messenger',  '$rootScope', '$location'];
  function PlanController(dbg, domServices, $state, $stateParams, planService, user, ngProgressFactory, $scope, messenger, $rootScope, $location) {
    dbg.log2('#PlanController  started');
    var vm = this;
    var urlParams = null;

    vm.planInModal = null;
    vm.selectedPlan = null;
    vm.currentStep = 1;
    vm.currentPlan = null;
    vm.fixedYearly = null;
    vm.fixedMonthly = null;

    vm.stepLayouts = [
      {
        inQueue: 1,
        src: "js/ngApp/components/dashboard-accountProfile-upgradePlan/steps/selectPlan.tpl.html"
      },
      {
        inQueue: 2,
        src: "js/ngApp/components/dashboard-accountProfile-upgradePlan/steps/confirmation.tpl.html"
      },
      {
        inQueue: 3,
        src: "js/ngApp/components/dashboard-accountProfile-upgradePlan/steps/submited.tpl.html"
      }
    ]

    vm.steps = [
      {
        title: "Choose a plan",
        number: 1,
        key: "selectPlan"
      },
      {
        title: "Confirmation",
        number: 2,
        key: "confirmation"
      },
      {
        title: "Submited",
        number: 3,
        key: "submited"
      }
    ]

    vm.planColors = {
      Single: {
        header: "list-group-item-heading yellow-header-bg",
        body: "price-label yellow-bg",
        light: "list-group-item-text yellow-light-bg"
      },
      Fixed: {
        header: "list-group-item-heading green-header-bg",
        body: "price-label green-bg",
        light: "list-group-item-text green-light-bg"
      },
      Unlimited: {
        header: "list-group-item-heading blue-header-bg",
        body: "price-label blue-bg",
        light: "list-group-item-text blue-light-bg"
      }
    };

    var modalTplPath = 'js/ngApp/components/dashboard-accountProfile-upgradePlan/tpls/';

    vm.subPlans = vm.testData;
    vm.isCurrentStep = isCurrentStep;
    vm.openPlanDetailsModal = openPlanDetailsModal;
    vm.checkIfUnlimited = checkIfUnlimited;
    vm.stepIsActive = stepIsActive;
    vm.stepIsCompleted = stepIsCompleted;
    vm.nextStep = nextStep;
    vm.previouseStep = previouseStep;
    vm.selectPlan = selectPlan;
    vm.submitOrder = submitOrder;
    vm.isCurrentPlan = isCurrentPlan;
    vm.showPlanInList = showPlanInList;
    vm.switchPlan = switchPlan;

    init();

    function init() {
      // if(urlParams){
      //   vm.currentStep = 3;
        succeededCheckout($location.search());
      // }else{
        // getPlans();
      // }
    }

    function getPlans() {
      planService.getAllPlans().then(function(result) {
        if(result.error){
          messenger.error(result.error);
        }else {
          vm.subPlans = result.plans;
          vm.currentPlan = result.currentPlan;
          angular.forEach(result.plans, function(result) {
            if(result.plan.id == "fixed_yearly"){
              vm.fixedYearly = result;
            }
            if(result.plan.id == "fixed_monthly"){
              vm.fixedMonthly = result;
            }
          });
        }
      })
    }

    function succeededCheckout(params) {
      console.log(params.id);
      planService.retrievCheckoutAndUpdateSub(params.id).then(function(result) {
        console.log(result);
      })
    }

    function submitOrder(tosConfirmed) {
      if(!tosConfirmed){
        domServices.shakeClass('shake-this');
      }else{
        planService.updatePlan(vm.selectedPlan.plan.id).then(function(response) {
          if(response.error){
            messenger.error(response.error);
          }else {
            if(response.redirect){
              window.location = response.result.url;
            }else{
              console.log(response);
              nextStep();
            }
          }
        })
      }
    }
  
    function selectPlan(plan) {
      vm.selectedPlan = plan;
      nextStep();
    }

    function nextStep(){
      vm.currentStep = vm.currentStep + 1
      return vm.currentStep;
    }

    function previouseStep() {
      vm.currentStep = vm.currentStep - 1
      return vm.currentStep;
    }

    function checkIfUnlimited(count) {
      if(count == -1){
        return "Unlimited";
      }else{
        return count;
      }
    }

    function isCurrentStep(inQueue){
      return vm.currentStep == inQueue;
    }

    function isCurrentPlan(planId) {
      return planId == vm.currentPlan.chargebeePlanId
    }

    function stepIsActive(step, additionalStyle) {
      if(vm.currentStep == step){
        return "active " + additionalStyle;
      }else{
        return additionalStyle;
      }
    }

    function stepIsCompleted(step, additionalStyle) {
      if(vm.currentStep > step){
        return "done " + additionalStyle;
      }
    }

    function openPlanDetailsModal(plan) {
      vm.planInModal = plan;
      vm.currentPlanModalContentTpl = modalTplPath + plan.id + '.tpl.html';
      domServices.modal('plansModal');
    }

    function showPlanInList(planId){
      if(planId == "free"){
        return false;
      }else if(planId == "fixed_yearly"){
        return false;
      }else{
        return true
      }
    }

    function switchPlan(switchPlan) {
      return vm.selectedPlan = switchPlan;
    }

  }

})();
