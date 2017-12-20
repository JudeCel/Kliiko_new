(function () {
  'use strict';

  angular.module('KliikoApp').
    controller('PlanController', PlanController);

  PlanController.$inject = ['dbg', 'domServices', '$state', '$stateParams', 'planService', 'user', '$scope', 'messenger',  '$rootScope', '$location', 'messagesUtil'];
  function PlanController(dbg, domServices, $state, $stateParams, planService, user, $scope, messenger, $rootScope, $location, messagesUtil) {
    dbg.log2('#PlanController  started');
    var vm = this;
    var urlParams = $location.search();

    vm.whatIsCredits = "Prorated credits are the credits that get created if, during the Change Subscription operation, the option Apply prorated credits and charges is selected. These credits cannot be added to subscriptions manually. When a subscription is renewed, the available credits are automatically redeemed and this will recur until the credits run out."

    vm.planInModal = null;
    vm.selectedPlan = null;
    vm.sessionCount = null;
    vm.possibleNumOfSessions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    vm.currentStep = 1;
    vm.currentPlan = null;
    vm.purchaseWasSuccessfull = true;
    vm.contactUsUser = {};

    vm.currencySymbols = {
      AUD: '$',
      USD: '$',
      CAD: '$',
      NZD: '$',
      GBP: '£',
      EUR: '€',
    };

    vm.pricePerEnding = {
      month: 'per Month',
      year: 'per Year'
    };

    vm.stepLayouts = [
      {
        inQueue: 1,
        src: "/js/ngApp/components/dashboard-accountProfile-upgradePlan/steps/selectPlan.tpl.html"
      },
      {
        inQueue: 2,
        src: "/js/ngApp/components/dashboard-accountProfile-upgradePlan/steps/confirmation.tpl.html"
      },
      {
        inQueue: 3,
        src: "/js/ngApp/components/dashboard-accountProfile-upgradePlan/steps/submitted.tpl.html"
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

    var modalTplPath = '/js/ngApp/components/dashboard-accountProfile-upgradePlan/tpls/';

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
    vm.switchPlan = switchPlan;
    vm.checkRadioButton = checkRadioButton;
    vm.openGetQuoteModal = openGetQuoteModal;
    vm.submitContactusForm = submitContactusForm;
    vm.buttonClassName = buttonClassName;
    vm.switchPlanView = switchPlanView;
    vm.selectPlanBtnColor = selectPlanBtnColor;
    vm.mostPopular = mostPopular;
    vm.upgradePlanText = upgradePlanText;
    vm.displayFeatureValue = displayFeatureValue;
    vm.finishedRenderingPlans = finishedRenderingPlans;
    vm.changePlanList = changePlanList;

    init();
    vm.setup = function() {
      if ($stateParams.step && $stateParams.plan) {
        vm.shouldShowPlan = $stateParams.plan;
        vm.currentStep = parseInt($stateParams.step);
      }
    };

    function init() {
      errorWhileCretingSubscription()
      if(urlParams.state == 'succeeded'){
        vm.currentStep = 3;
        succeededCheckout($location.search());
        removeUrlParams(['state', 'id'])
      }else if(urlParams.state == 'cancelled'){
        messenger.error(messagesUtil.upgradePlan.orderCancelled);
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
          vm.currencyData = result.currencyData;
          vm.currentCurrency = vm.currencyData.client;
          vm.currencyList = Object.keys(vm.currencyData.rates);
          vm.currencyList.unshift(vm.currencyData.base);
          vm.annualOrMonthly = 'month';
          // vm.free_account = result.free_account;
          vm.plans = result.plans;
          vm.additionalParams = result.additionalParams;
          changePlanList();

          if(vm.shouldShowPlan) {
            setSelectedPlan(vm.plans[vm.currentCurrency].year);
            setSelectedPlan(vm.plans[vm.currentCurrency].month);
          }
          vm.currentPlan = result.currentPlan;
          vm.features = result.features;
        }
      })
    }

    function setSelectedPlan(array) {
      if (!array) {
        return;
      }
      array.forEach(function(item) {
        if(item.plan.preference === vm.shouldShowPlan) {
          vm.selectedPlan = item;
          vm.sessionCount = 1;
        }
      });
    }

    function changePlanList() {
      vm.plansList = angular.copy(vm.plans[vm.currentCurrency][vm.annualOrMonthly]);
      //vm.plansList.unshift(vm.free_account);
    }

    function succeededCheckout(params) {
      planService.retrievCheckoutAndUpdateSub(params.id).then(function(result) {
        if(result.error){
          vm.purchaseWasSuccessfull = false;
          messenger.error(result.error);
        }else{
          user.reloadPermissions();
          messenger.ok(result.message);
        }
      })
    }

    function submitOrder(tosConfirmed) {
      if(!tosConfirmed){
        domServices.shakeClass('shake-this');
      }else{
        planService.updatePlan(vm.selectedPlan.plan.id, vm.sessionCount).then(function(response) {
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
      vm.sessionCount = 1;
      $(".planHint").hide();
      nextStep();
    }

    vm.dropdownSelectedPlan = function(planItem) {
      if (!vm.isCurrentPlan(planItem)) {
        vm.selectedPlan = planItem;
        vm.sessionCount = 1;
      }
    };

    function checkRadioButton(currentPlan, checkPlan) {
      if(currentPlan && checkPlan) {
        return currentPlan.plan.id == checkPlan.plan.id;
      }
    }

    function nextStep(){
      return ++vm.currentStep;
    }

    function previouseStep() {
      vm.selectedPlan = null;
      vm.sessionCount = null;
      return --vm.currentStep;
    }

    function checkTheCount(count) {
      if(count < 0){
        return "Unlimited";
      }else{
        return count;
      }
    }

    function isCurrentStep(inQueue){
      return vm.currentStep == inQueue;
    }

    function isCurrentPlan(subPlan) {
      return subPlan.plan.id.includes(vm.currentPlan.preferenceName);
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

    function switchPlan(switchPlan) {
      vm.selectedPlan = switchPlan;
      vm.sessionCount = 1;
    }

    function openGetQuoteModal(user) {
      vm.contactUsUser = {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        contactNumber: user.mobile,
        companyName: user.companyName
      }
      domServices.modal('getQuoteModal');
    }

    function buttonClassName(view) {
      var className = 'option-btn-red btn-dashboard-plans';
      return vm.annualOrMonthly == view ? className + ' active' : className;
    }

    function switchPlanView(view) {
      vm.annualOrMonthly = view;
      changePlanList()
      setTimeout(function () {
        updateCurrentPlanStyle(vm.currentPlan.preferenceName);
      });
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

    function selectPlanBtnColor(plan) {
      return plan + "_btn"
    }

    function mostPopular(planId) {
      return 'core_monthly' == planId;
    }

    function upgradePlanText(plan) {
      return plan.price ? "BUY" : "GET STARTED"
    }

    vm.showBoolean = function(feature, plan) {
      return (feature.type == 'Boolean' && vm.getFeatureValue(feature.key, plan));
    }

    vm.getFeatureValue = function(key, plan) {
      return vm.additionalParams[plan.preference][key];
    }

    vm.showNumber = function(feature) {
      return (feature.type == 'Number' || feature.type == 'NumberLimit');
    }

    vm.multipleDays = function () {
      return (vm.currentPlan.daysLeft > 1);
    }

    function displayFeatureValue(feature, plan) {
      var result = checkTheCount(vm.getFeatureValue(feature.key, plan));
      if (feature.type == 'NumberLimit') {
        result = 'up to ' + result + "/mth";
      }
      return result;
    }

    function setCurrentPlanOverlaySize(highlightElement, currentElement, hostTable) {
      highlightElement.width(currentElement.width());
      highlightElement.height(hostTable.height());
    }

    function updateCurrentPlanStyle(planStyle) {
      var style = "."+planStyle;
      var highlightElement = $(".included-plan-fader");
      var currentElement = $(style);
      var hostTable = $('.plans-table table');

      setCurrentPlanOverlaySize(highlightElement, currentElement, hostTable);

      jQuery(window).resize(function() {
        setCurrentPlanOverlaySize(highlightElement, currentElement, hostTable)
      });
    }

    function finishedRenderingPlans() {
      setTimeout(function () {
        updateCurrentPlanStyle(vm.currentPlan.preferenceName);
      });
    }
  }
})();
