(function () {
  'use strict';

  angular.module('KliikoApp').controller('SessionBuilderController', SessionBuilderController);

  SessionBuilderController.$inject = ['dbg', 'messenger', 'SessionModel','$state', '$stateParams', '$filter', 'domServices', '$ocLazyLoad', '$q'];
  function SessionBuilderController(dbg, messenger, SessionModel, $state, $stateParams, $filter, domServices, $ocLazyLoad, $q) {
    dbg.log2('#SessionBuilderController started');

    var vm = this;

    vm.step1 = {};
    vm.accordions = {};
    vm.participants = [];
    vm.observers = [];
    vm.basePath = '/js/ngApp/components/dashboard-chatSessions-builder/';

    vm.$state = $state;


    var sessionId = $stateParams.id || null;

    vm.session = new SessionModel(sessionId);
    vm.session.init().then(function(res) {


    vm.dateTime = {
      hstep:1,
      mstep: 15,

      options: {
        hstep: [1, 2, 3],
        mstep: [1, 5, 10, 15, 25, 30]
      }
    };


      parseDateAndTime('initial');
    });
    //todo @pavel: convert time if it is there already


    //vm.currentStep = $stateParams.currentStep;
    vm.currentStep = 1;



    vm.closeSession = closeSession;
    vm.stepsClassIsActive = stepsClassIsActive;
    vm.updateStep = updateStep;
    vm.goToStep = goToStep;
    vm.currentPageToDisplay = currentPageToDisplay;

    // step 2
    vm.selectFacilitatorsClickHandle = selectFacilitatorsClickHandle;
    vm.faderHack = faderHack;

    // step 4 + 5
    vm.finishSelectingMembers = finishSelectingMembers;
    vm.selectParticipantsClickHandle = selectParticipantsClickHandle;
    vm.selectObserversClickHandle = selectObserversClickHandle;

    function closeSession() {
      vm.session.cancel();
    }

    function goToStep(step) {
      if (!angular.isNumber(step)) {
        if (step === 'back') { step = vm.currentStep - 1; vm.cantMoveNextStep = false; }
        if (step === 'next') { step = vm.currentStep + 1 }
        if (step === 'submit') {
          //step = 5;
          //submitUpgrade();
          return
        }
      }

      var valid = validateStep(step);

      if (!valid) return;

      initStep(step).then(function(res) {
        vm.session.updateStep();

        $stateParams.planUpgradeStep = vm.currentStep = step;
      });



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

    function initStep(step) {
      var deferred = $q.defer();

      if (step == 2) {
        $ocLazyLoad.load([
          '/js/vendors/ngDraggable/ngDraggable.js',
          '/js/ngApp/components/dashboard-resources-contactLists/contactListsControllerServices.js',
          '/js/ngApp/components/dashboard-resources-contactLists/ContactListsController.js',
          '/js/ngApp/components/dashboard-resources-contactLists/ListsModel.js',
          '/js/ngApp/components/dashboard-resources-contactLists/ListItemModel.js',
          '/js/ngApp/components/dashboard-resources-contactLists/ListItemMemberModel.js',
          '/js/ngApp/modules/contactList/contactList.js',
          '/js/ngApp/directives/custom-select-directive.js',
          '/js/vendors/ng-file-upload/ng-file-upload.js',
          '/js/ngApp/filters/num.js',
          '/js/ngApp/filters/human2Camel.js'
        ]).then(function(res) {
          deferred.resolve();
        });
      }
      else if(step == 3) {
        deferred.resolve();
      }
      else if(step == 4) {
        $ocLazyLoad.load([
          '/js/vendors/ngDraggable/ngDraggable.js',
          '/js/ngApp/components/dashboard-resources-contactLists/contactListsControllerServices.js',
          '/js/ngApp/components/dashboard-resources-contactLists/ContactListsController.js',
          '/js/ngApp/components/dashboard-resources-contactLists/ListsModel.js',
          '/js/ngApp/components/dashboard-resources-contactLists/ListItemModel.js',
          '/js/ngApp/components/dashboard-resources-contactLists/ListItemMemberModel.js',
          '/js/ngApp/modules/contactList/contactList.js',
          '/js/ngApp/directives/custom-select-directive.js',
          '/js/vendors/ng-file-upload/ng-file-upload.js',
          '/js/ngApp/filters/num.js',
          '/js/ngApp/filters/human2Camel.js'
        ]).then(function(res) {
          deferred.resolve();
        });
      }
      else if(step == 5) {
        $ocLazyLoad.load([
          '/js/vendors/ngDraggable/ngDraggable.js',
          '/js/ngApp/components/dashboard-resources-contactLists/contactListsControllerServices.js',
          '/js/ngApp/components/dashboard-resources-contactLists/ContactListsController.js',
          '/js/ngApp/components/dashboard-resources-contactLists/ListsModel.js',
          '/js/ngApp/components/dashboard-resources-contactLists/ListItemModel.js',
          '/js/ngApp/components/dashboard-resources-contactLists/ListItemMemberModel.js',
          '/js/ngApp/modules/contactList/contactList.js',
          '/js/ngApp/directives/custom-select-directive.js',
          '/js/vendors/ng-file-upload/ng-file-upload.js',
          '/js/ngApp/filters/num.js',
          '/js/ngApp/filters/human2Camel.js'
        ]).then(function(res) {
          deferred.resolve();
        });
      }

      return deferred.promise;
    }

    function stepsClassIsActive(step) {
      return (vm.currentStep == step);
    }

    function updateStep(stepNumber) {
      if (stepNumber && stepNumber === 1) parseDateAndTime();
      vm.session.updateStep();

    }

    /**
     * convert date and time inputs to timestamp in session object -> steps -> step1 for start and rnd dates
     */
    function parseDateAndTime(initial) {
      var startDate, startHours, startMinutes, endDate, endHours, endMinutes;

      if (initial) {
        vm.step1.startDate = new Date(vm.session.steps.step1.startTime);
        vm.step1.startTime = new Date(vm.session.steps.step1.startTime);

        vm.step1.endDate = new Date(vm.session.steps.step1.endTime);
        vm.step1.endTime = new Date(vm.session.steps.step1.endTime);


      } else {
        if (vm.step1.startDate && vm.step1.startTime) {
          startDate = new Date(vm.step1.startDate);
          startHours = new Date(vm.step1.startTime).getHours();
          startMinutes = new Date(vm.step1.startTime).getMinutes();

          startDate.setHours(startHours);
          startDate.setMinutes(startMinutes);

          vm.session.steps.step1.startTime = startDate;
        }

        if (vm.step1.endDate && vm.step1.endTime) {
          endDate = new Date(vm.step1.endDate);
          endHours = new Date(vm.step1.endTime).getHours();
          endMinutes = new Date(vm.step1.endTime).getMinutes();

          endDate.setHours(endHours);
          endDate.setMinutes(endMinutes);

          vm.session.steps.step1.endTime = endDate;
        }
      }


    }


    function currentPageToDisplay() {
      if(vm.searchingParticipants || vm.searchingObservers) {
        return 'contactLists.html';
      }
      else {
        return `step${vm.currentStep}.tpl.html`;
      }
    }

    /// step 2

    function selectFacilitatorsClickHandle() {
      domServices.modal('sessionBuilderSelectFacilitatorModal');
    }

    function faderHack() {
      setTimeout(function() {
        jQuery('.modal-backdrop.fade.in').hide();
      }, 10);
    }

    /// step 4 + 5

    function selectParticipantsClickHandle() {
      vm.searchingParticipants = true;
    }

    function selectObserversClickHandle() {
      vm.searchingObservers = true;
    }

    function finishSelectingMembers(members) {
      if(vm.searchingParticipants) {
        vm.participants = selectMembers(members);
        vm.searchingParticipants = false;
      }
      else if(vm.searchingObservers) {
        vm.observers = selectMembers(members);
        vm.searchingObservers = false;
      }
    }

    function selectMembers(members) {
      var selected = [];
      for(var i in members) {
        var member = members[i];
        if(member._selected) {
          selected.push(member);
        }
      }
      return selected;
    }

  }
})();
