(function () {
  'use strict';

  angular.module('KliikoApp').
    controller('PlanController', PlanController);

  PlanController.$inject = ['dbg', 'domServices', '$state', '$stateParams', 'planService', 'user', 'ngProgressFactory', '$scope', 'messenger',  '$rootScope', '$location'];
  function PlanController(dbg, domServices, $state, $stateParams, planService, user, ngProgressFactory, $scope, messenger, $rootScope, $location) {
    dbg.log2('#PlanController  started');
    var vm = this;
    var urlParams = $location.search();

    vm.planInModal = null;
    vm.selectedPlan = null;
    vm.currentStep = 1;
    vm.currentPlan = null;
    vm.fixedYearly = null;
    vm.fixedMonthly = null;
    vm.purchaseWasSuccessfull = true

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
        src: "js/ngApp/components/dashboard-accountProfile-upgradePlan/steps/submitted.tpl.html"
      }
    ]

    vm.steps = [
      {
        title: "Select Plan Upgrade",
        number: 1,
        key: "selectPlan"
      },
      {
        title: "Confirmation",
        number: 2,
        key: "confirmation"
      },
      {
        title: "Submitted",
        number: 3,
        key: "submitted"
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
    vm.checkTheCount = checkTheCount;
    vm.stepIsActive = stepIsActive;
    vm.stepIsCompleted = stepIsCompleted;
    vm.nextStep = nextStep;
    vm.previouseStep = previouseStep;
    vm.selectPlan = selectPlan;
    vm.submitOrder = submitOrder;
    vm.isCurrentPlan = isCurrentPlan;
    vm.showPlanInList = showPlanInList;
    vm.switchPlan = switchPlan;
    vm.showCalculatedPrice = showCalculatedPrice;

    init();

    function init() {
      errorWhileCretingSubscription()
      if(urlParams.state == 'succeeded'){
        vm.currentStep = 3;
        succeededCheckout($location.search());
        removeUrlParams(['state', 'id'])
      }else if(urlParams.state == 'cancelled'){
        messenger.error("Order was cancelled");
        removeUrlParams(['state'])
        getPlans();
      }else{
        getPlans();
      }
    }

    function removeUrlParams(params) {
      angular.forEach(params, function(value) {
        $location.search(value, null);
      });
    }

    function errorWhileCretingSubscription() {
      if(urlParams.error) {
        messenger.error(urlParams.error);
        $location.search('error', null)
      }
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
      planService.retrievCheckoutAndUpdateSub(params.id).then(function(result) {
        if(result.error){
          vm.purchaseWasSuccessfull = false;
          messenger.error(result.error);
        }else{
          messenger.ok(result.message);
        }
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
              window.location = response.hosted_page.url;
            }else{
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
      return ++vm.currentStep;
    }

    function previouseStep() {
      return --vm.currentStep;
    }

    function checkTheCount(count) {
      if(count == -1){
        return "Unlimited";
      } else if(count == 0) {
        return "No";
      }else{
        return count;
      }
    }

    function isCurrentStep(inQueue){
      return vm.currentStep == inQueue;
    }

    function isCurrentPlan(planId) {
      if(planId == 'fixed_monthly'){
        return vm.currentPlan.chargebeePlanId == 'fixed_yearly' || vm.currentPlan.chargebeePlanId == 'fixed_monthly';
      }else{
        return planId == vm.currentPlan.chargebeePlanId
      }
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
      if(planId == "free" || planId == "fixed_yearly"){
        return false;
      }else{
        return true
      }
    }

    function switchPlan(switchPlan) {
      vm.selectedPlan = switchPlan;
    }

    function showCalculatedPrice(price) {
      return price / 100;
    }

  }

})();
