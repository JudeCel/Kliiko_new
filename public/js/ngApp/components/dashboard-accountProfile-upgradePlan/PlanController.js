(function () {
  'use strict';

  angular.module('KliikoApp').
    controller('PlanController', PlanController);

  PlanController.$inject = ['dbg', 'domServices', '$state', '$stateParams', 'planService', 'user', '$scope', 'messenger',  '$rootScope', '$location'];
  function PlanController(dbg, domServices, $state, $stateParams, planService, user, $scope, messenger, $rootScope, $location) {
    dbg.log2('#PlanController  started');
    var vm = this;
    var urlParams = $location.search();

    vm.whatIsCredits = "Prorated credits are the credits that get created if, during the Change Subscription operation, the option Apply prorated credits and charges is selected. These credits cannot be added to subscriptions manually. When a subscription is renewed, the available credits are automatically redeemed and this will recur until the credits run out."

    vm.planInModal = null;
    vm.selectedPlan = null;
    vm.currentStep = 1;
    vm.currentPlan = null;
    vm.monthlyPlan = null;
    vm.yearlyPlan = null;
    vm.purchaseWasSuccessfull = true;
    vm.subPlans = [];
    vm.contactUsUser = {};
    vm.monthlyPlans = [];
    vm.annualPlans = [];

    vm.planOptions = [
      'Number of Active Sessions',
      'Number of Contact Lists',
      'Recruiter lists \n (build Contact Lists on demand)',
      'Import and manage your \n existing contacts',
      'Custom logo and branding',
      'Contacts per account',
      'Managers per account',
      'Export contact and \n participation history',
      'Export Recruiter survey results',
      'Access klzii Forum',
      'Access klzii Focus',
      'Observers can watch sessions',
      'Paid SMS reminders for participants',
      'Tips for guiding discussions',
      'Whiteboard functionality',
      'Upload and store multimedia',
      'Reporting and analysis',
      'Mobile and tablet compatible',
      'Customise email invitations \n and reminders',
      'Number of topics',
      'Private and secure sessions (SSL)'
    ]

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
      junior_yearly: {
        header: "list-group-item-heading junior_yearly_light",
        body: "price-label junior_yearly_dark",
        light: "list-group-item-text yellow-light-bg"
      },
      core_yearly: {
        header: "list-group-item-heading core_yearly_light",
        body: "price-label core_yearly_dark",
        light: "list-group-item-text green-light-bg"
      },
      senior_yearly: {
        header: "list-group-item-heading senior_yearly_light",
        body: "price-label senior_yearly_dark",
        light: "list-group-item-text blue-light-bg"
      },

      junior_monthly: {
        header: "list-group-item-heading junior_monthly_light",
        body: "price-label junior_monthly_dark",
        light: "list-group-item-text yellow-light-bg"
      },
      core_monthly: {
        header: "list-group-item-heading core_monthly_light",
        body: "price-label core_monthly_dark",
        light: "list-group-item-text green-light-bg"
      },
      senior_monthly: {
        header: "list-group-item-heading senior_monthly_light",
        body: "price-label senior_yearly_dark",
        light: "list-group-item-text blue-light-bg"
      }
    };

    var modalTplPath = 'js/ngApp/components/dashboard-accountProfile-upgradePlan/tpls/';

    vm.isCurrentStep = isCurrentStep;
    vm.openPlanDetailsModal = openPlanDetailsModal;
    vm.checkTheCount = checkTheCount;
    vm.stepIsActive = stepIsActive;
    vm.stepIsCompleted = stepIsCompleted;
    vm.nextStep = nextStep;
    vm.previouseStep = previouseStep;
    vm.wantThisPlan = wantThisPlan;
    vm.submitOrder = submitOrder;
    vm.isCurrentPlan = isCurrentPlan;
    vm.showPlanInList = showPlanInList;
    vm.switchPlan = switchPlan;
    vm.showCalculatedPrice = showCalculatedPrice;
    vm.checkRadioButton = checkRadioButton;
    vm.optionBackground = optionBackground;
    vm.openContactUsModal = openContactUsModal;
    vm.submitContactusForm = submitContactusForm;
    vm.switchPlanView = switchPlanView;
    vm.planOptionColor = planOptionColor;
    vm.selectPlanBtnColor = selectPlanBtnColor;

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
          result.plans.map(function (subPlan) {
            if (subPlan.plan.period_unit == 'month' && subPlan.additionalParams.priority > 0) {
              vm.monthlyPlans.push(subPlan);
            }

            if (subPlan.plan.period_unit == 'year' && subPlan.additionalParams.priority > 0) {
              vm.annualPlans.push(subPlan);
            }
          });

          vm.subPlans = vm.monthlyPlans;
          vm.currentPlan = result.currentPlan;
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

    function wantThisPlan(selectedSubPlan) {
      vm.selectedPlan = selectedSubPlan;

      vm.subPlans.map(function(subPlan) {
        if(subPlan.plan.id == vm.selectedPlan.plan.id) {
          vm.monthlyPlan = subPlan;
        }

        if(subPlan.plan.period_unit == "year" && subPlan.plan.name.includes(vm.selectedPlan.plan.name)) {
          vm.yearlyPlan = subPlan;
        }
      });

      nextStep();
    }

    function checkRadioButton(currentPlan, checkPlan) {
      if(currentPlan && checkPlan) {
        return currentPlan.plan.id == checkPlan.plan.id;
      }
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
        return "false";
      }else{
        return count;
      }
    }

    function isCurrentStep(inQueue){
      return vm.currentStep == inQueue;
    }

    function isCurrentPlan(subPlan) {
      return vm.currentPlan.chargebeePlanId == subPlan.plan.id;
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

    function openPlanDetailsModal(subscriptionPlan) {
      vm.planInModal = subscriptionPlan;
      vm.currentPlanModalContentTpl = modalTplPath + subscriptionPlan.plan.id + '.tpl.html';
      domServices.modal('plansModal');
    }

    function showPlanInList(plan){
      return plan.additionalParams.priority > 0;
    }

    function switchPlan(switchPlan) {
      vm.selectedPlan = switchPlan;
    }

    function showCalculatedPrice(price) {
      return price / 100;
    }

    function optionBackground(index) {
      if(index%2 > 0) {
        return "background-color: #dedede;"
      }else{
        return "background-color: #cdcdcd;"
      }
    }

    function openContactUsModal(user) {
      vm.contactUsUser = {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        contactNumber: user.mobile,
        companyName: user.companyName
      }
      domServices.modal('contactUsModal');
    }
    function switchPlanView(view) {
      if (view == 'annual') {
        vm.subPlans = vm.annualPlans;
      }
      if (view == 'monthly') {
        vm.subPlans = vm.monthlyPlans;
      }
    }

    function submitContactusForm() {
      planService.submitContactusForm(vm.contactUsUser).then(function(result) {
        if(result.error){
          messenger.error(result.error);
        }else{
          messenger.ok(result.message);
        }
      });
    }

    function planOptionColor(plan, index) {
      if (index%2 > 0) {
        return plan + "_light";
      }else{
        return plan + "_dark";
      }
    }

    function selectPlanBtnColor(plan) {
      return plan + "_btn"
    }
  }
})();
