(function () {
  'use strict';

  angular.module('KliikoApp').
    controller('PlanController', PlanController);

  PlanController.$inject = ['dbg', 'domServices', '$state', '$stateParams', 'planService', 'user', 'ngProgressFactory', '$scope', 'messenger',  '$rootScope'];
  function PlanController(dbg, domServices, $state, $stateParams, planService, user, ngProgressFactory, $scope, messenger, $rootScope) {
    dbg.log2('#PlanController  started');
    var vm = this;

    vm.planInModal = null;
    vm.selectedPlan = null;
    vm.currentStep = 1;

    // vm.currentPlan = null;
    vm.currentPlan = {
      additionalContactListCount: -1,
      chargebeePlanId: "plan5",
      contactListCount: 1,
      contactListMemberCount: -1,
      createdAt: "2016-03-22T08:13:27.509Z",
      deletedAt: null,
      id: 4,
      observerCount: 15,
      paidSmsCount: 600,
      participantCount: 8,
      priority: 4,
      sessionCount: -1,
      surveyCount: -1,
      updatedAt: "2016-03-22T08:13:27.509Z"
    }

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

    vm.canSeeBackButton = canSeeBackButton;
    vm.canSeeOrderButton = canSeeOrderButton;
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

    init();

    function init() {
      // planService.getAllPlans().then(function(result) {
      //   if(result.error){
      //     messenger.error(result.error);
      //   }else {
      //     console.log(result);
      //     vm.subPlans = result.plans;
      //     vm.currentPlan = result.currentPlan;
      //   }
      // })

      vm.subPlans = [ { plan: 
     { id: 'plan2',
       name: 'Fixed',
       invoice_name: 'Fixed',
       price: 50000,
       period: 1,
       period_unit: 'month',
       charge_model: 'per_unit',
       free_quantity: 0,
       status: 'active',
       enabled_in_hosted_pages: true,
       enabled_in_portal: true,
       object: 'plan',
       taxable: true },
    chargeEstimate: 
     { created_at: 1458981857,
       recurring: true,
       subscription_id: '1sjs9fzPgTWHFbXk',
       subscription_status: 'active',
       term_ends_at: 1461660257,
       collect_now: true,
       price_type: 'tax_exclusive',
       amount: 50000,
       credits_applied: 0,
       amount_due: 50000,
       object: 'estimate',
       sub_total: 50000,
       line_items: [Object] },
    additionalParams: 
     { sessionCount: 3,
       contactListCount: 1,
       surveyCount: 1,
       additionalContactListCount: 1,
       contactListMemberCount: -1,
       participantCount: 8,
       observerCount: 15,
       paidSmsCount: 50,
       priority: 3 } },
  { plan: 
     { id: 'plan1',
       name: 'Single',
       invoice_name: 'Plan 1',
       price: 15000,
       period: 1,
       period_unit: 'month',
       trial_period: 30,
       trial_period_unit: 'day',
       charge_model: 'per_unit',
       free_quantity: 0,
       status: 'active',
       enabled_in_hosted_pages: true,
       enabled_in_portal: true,
       object: 'plan',
       taxable: true },
    chargeEstimate: 
     { created_at: 1458981857,
       recurring: true,
       subscription_id: '1sjs9fzPgTWHFbXk',
       subscription_status: 'in_trial',
       term_ends_at: 1461511675,
       collect_now: false,
       price_type: 'tax_exclusive',
       amount: 15000,
       credits_applied: 0,
       amount_due: 15000,
       object: 'estimate',
       sub_total: 15000,
       line_items: [Object] },
    additionalParams: 
     { sessionCount: 1,
       contactListCount: 1,
       surveyCount: 1,
       additionalContactListCount: 0,
       contactListMemberCount: -1,
       participantCount: 8,
       observerCount: 15,
       paidSmsCount: 50,
       priority: 2 } },
  { plan: 
     { id: 'plan3',
       name: 'Unlimited',
       invoice_name: 'Unlimited',
       price: 90000,
       period: 1,
       period_unit: 'month',
       charge_model: 'per_unit',
       free_quantity: 0,
       status: 'active',
       enabled_in_hosted_pages: true,
       enabled_in_portal: true,
       object: 'plan',
       taxable: true },
    chargeEstimate: 
     { created_at: 1458981857,
       recurring: true,
       subscription_id: '1sjs9fzPgTWHFbXk',
       subscription_status: 'active',
       term_ends_at: 1461660257,
       collect_now: true,
       price_type: 'tax_exclusive',
       amount: 90000,
       credits_applied: 0,
       amount_due: 90000,
       object: 'estimate',
       sub_total: 90000,
       line_items: [Object] },
    additionalParams: 
     { sessionCount: -1,
       contactListCount: 1,
       surveyCount: -1,
       additionalContactListCount: -1,
       contactListMemberCount: -1,
       participantCount: 8,
       observerCount: 15,
       paidSmsCount: 600,
       priority: 4 } } ]
  
    }

    function selectPlan(plan) {
      vm.selectedPlan = plan;
      nextStep();
    }

    function submitOrder(tosConfirmed) {
      if(!tosConfirmed){
        domServices.shakeClass('shake-this');
      }else{
        planService.updatePlan(vm.selectedPlan.plan.id).then(function(result) {
          if(result.error){
            messenger.error(result.error);
          }else {
            dbg.yell(result);
          }
        })
      }
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

    function canSeeBackButton() {
      return vm.currentStep < 1 || vm.currentStep > 3;
    }

    function canSeeOrderButton() {
      return vm.currentStep < 1 || vm.currentStep > 3;
    }

  }

})();
