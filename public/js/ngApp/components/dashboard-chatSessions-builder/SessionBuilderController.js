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
      vm.mouseOveringMember = [];
      vm.sessionMemberValidations = {
        facilitator: {
          min: 1,
          max: 1
        },
        participant: {
          min: 8,
          max: 8
        },
        observer: {
          min: 0,
          max: 15
        },
      }

      vm.dateTime = {
        hstep:1,
        mstep: 15,

        options: {
          hstep: [1, 2, 3],
          mstep: [1, 5, 10, 15, 25, 30]
        }
      };

      vm.participants = vm.session.steps.step4.participants;
      vm.observers = vm.session.steps.step5.observers;
      vm.chatSessionTopicsList = [];

      parseDateAndTime('initial');
    });
    //todo @pavel: convert time if it is there already


    //vm.currentStep = $stateParams.currentStep;
    vm.currentStep = 1; //todo change this to page fetcherS

    vm.selectedTopics = {};
    vm.allTopicsSelected = false;

    vm.closeSession = closeSession;
    vm.stepsClassIsActive = stepsClassIsActive;
    vm.updateStep = updateStep;
    vm.goToStep = goToStep;
    vm.currentPageToDisplay = currentPageToDisplay;

    // step 2
    vm.selectFacilitatorsClickHandle = selectFacilitatorsClickHandle;
    vm.faderHack = faderHack;
    vm.topicsOnDropComplete = topicsOnDropComplete;
    vm.removeTopicFromList = removeTopicFromList;
    vm.reorderTopics = reorderTopics;
    vm.topicSelectClickHandle = topicSelectClickHandle;
    vm.selectAllTopics = selectAllTopics;

    // step 4 + 5
    vm.showCorrectStatus = showCorrectStatus;
    vm.inviteMembers = inviteMembers;
    vm.modalWindowHandler = modalWindowHandler;
    vm.finishSelectingMembers = finishSelectingMembers;
    vm.selectParticipantsClickHandle = selectParticipantsClickHandle;
    vm.selectObserversClickHandle = selectObserversClickHandle;
    vm.selectedAllMembers = selectedAllMembers;
    vm.findSelectedMembers = findSelectedMembers;
    vm.removeFromList = removeFromList;
    vm.sendGenericEmail = sendGenericEmail;

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

      vm.searchingParticipants = false;
      vm.searchingObservers = false;
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
          '/js/ngApp/filters/human2Camel.js',

          '/js/ngApp/components/dashboard-resources-topics/TopicsController.js',
          '/js/ngApp/modules/topicsAndSessions/topicsAndSessions.js'
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

    function topicsOnDropComplete(data, event) {
      if (!data) return;

      thisAdd(data);

      // if there more topics selected, then "drop" them also
      if ( Object.keys(vm.selectedTopics).length ) {
        for (var key in vm.selectedTopics) {
          thisAdd(vm.selectedTopics[key]);
        }
      }

      function thisAdd(data) {
        // check if this topic already in selected chat session topics list
        if (vm.chatSessionTopicsList.length) {
          for (var i = 0; i < vm.chatSessionTopicsList.length ; i++) {
            if (data.id ==  vm.chatSessionTopicsList[i].id ) return;
          }

          data.topic_order_id = vm.chatSessionTopicsList.length;

          vm.chatSessionTopicsList.push(data);
        } else {
          vm.chatSessionTopicsList.push(data);
        }
      }



    }

    function removeTopicFromList(id) {
      var index;
      for (var i = 0, len = vm.chatSessionTopicsList.length; i < len ; i++) {
        if ( id ==  vm.chatSessionTopicsList[i].id ) {
          index = i;
          break;
        }
      }

      vm.chatSessionTopicsList.splice(index, 1);
      index = null;
    }

    function reorderTopics(data, t) {
      var droppedOrderId = data.topic_order_id;
      var targetOrderId = t.topic_order_id;

      for (var i = 0, len = vm.chatSessionTopicsList.length; i < len ; i++) {
        if (data.id == vm.chatSessionTopicsList[i].id) vm.chatSessionTopicsList[i].topic_order_id = targetOrderId;
        if (t.id == vm.chatSessionTopicsList[i].id) vm.chatSessionTopicsList[i].topic_order_id = droppedOrderId;
      }

    }

    function topicSelectClickHandle(topicObj) {
      if ( vm.selectedTopics.hasOwnProperty(topicObj.id) ) {
        delete vm.selectedTopics[topicObj.id];
      } else {
        vm.selectedTopics[topicObj.id] = topicObj;
      }

    }

    function selectAllTopics(allTopics) {
      vm.allTopicsSelected = !vm.allTopicsSelected;

      vm.selectedTopics = {};
      if (vm.allTopicsSelected) {
        for (var i = 0, len = allTopics.length; i < len ; i++) {
          vm.selectedTopics[ allTopics[i].id ] = allTopics[i];
        }
      }


    }

    /// step 4 + 5
    function showCorrectStatus(member) {
      if(member.invite) {
        return member.invite.status;
      }
      else if(member.sessionMember) {
        return 'confirmed';
      }
    }

    function inviteMembers() {
      var data = findSelectedMembers();

      if(data.length > 0) {
        var promise;
        if(vm.currentStep == 4) {
          promise = vm.session.inviteParticipants(data);
        }
        else if(vm.currentStep == 5) {
          promise = vm.session.inviteObservers(data);
        }

        promise.then(function(res) {
          for(var i in data) {
            var member = data[i];
            removeFromList(member, true);
          }

          if(vm.currentStep == 4) {
            vm.participants = vm.participants.concat(res.data);
          }
          else if(vm.currentStep == 5) {
            vm.observers = vm.observers.concat(res.data);
          }

          messenger.ok(res.message);
        }, function(error) {
          messenger.error(error);
        });
      }
      else {
        messenger.error('No contacts selected');
      }
    }

    function showSmsWindow(data) {
      if(data.length > 0) {
        var noMobile = {};
        for(var i in data) {
          var member = data[i];
          if(!member.mobile) {
            noMobile[member.firstName + ' ' + member.lastName] = ' has no mobile provided';
          }
        }

        if(Object.keys(noMobile).length == 0) {
          vm.sendSmsTo = data;
          vm.sendSmsMessage = null;
          domServices.modal('sessionBuilder-sendSmsModal');
        }
        else {
          messenger.error(noMobile);
        }
      }
      else {
        messenger.error('No contacts selected');
      }
    }

    function modalWindowHandler(modal, data) {
      if(modal === 'showSms') {
        showSmsWindow(data);
      }
      else if(modal === 'sendSms') {
        vm.session.sendSms(vm.sendSmsTo, vm.sendSmsMessage).then(function(message) {
          domServices.modal('sessionBuilder-sendSmsModal', 'close');
          messenger.ok(message);
        }, function(error) {
          messenger.error(error);
        });
      }
    }

    function selectParticipantsClickHandle() {
      vm.searchingParticipants = true;
    }

    function selectObserversClickHandle() {
      vm.searchingObservers = true;
    }

    function currentMemberList() {
      if(vm.currentStep == 4) {
        return vm.participants;
      }
      else if(vm.currentStep == 5) {
        return vm.observers;
      }
    }

    function currentStepString() {
      if(vm.currentStep == 4) {
        return 'step4';
      }
      else if(vm.currentStep == 5) {
        return 'step5';
      }
    }

    function selectedAllMembers() {
      var members = currentMemberList();
      var stepString = currentStepString();

      for(var i in members) {
        var member = members[i];
        if(!showCorrectStatus(member)) {
           member[stepString] = vm.selectedAll;
        }
      }
    }

    function findSelectedMembers() {
      var array = [];
      var members = currentMemberList();
      var stepString = currentStepString();

      for(var i in members) {
        var member = members[i];
        if(member[stepString]) {
          array.push(member);
        }
      }

      return array;
    }

    function finishSelectingMembers(activeList) {
      if(vm.searchingParticipants) {
        vm.participants = vm.participants.concat(selectMembers(activeList.id, activeList.members));
        vm.participants = removeDuplicatesFromArray(vm.participants);
        vm.searchingParticipants = false;
      }
      else if(vm.searchingObservers) {
        vm.observers = vm.observers.concat(selectMembers(activeList.id, activeList.members));
        vm.observers = removeDuplicatesFromArray(vm.observers);
        vm.searchingObservers = false;
      }
    }

    function removeFromList(member, skipDb) {
      if(skipDb) {
        removeMemberFromList(member);
      }
      else {
        var confirmed = confirm('Are you sure you want to do this?');
        if(!confirmed) return;

        vm.session.removeMember(member).then(function(res) {
          removeMemberFromList(member);
          messenger.ok(res.message);
        }, function(error) {
          messenger.error(error);
        });
      }
    }

    function removeMemberFromList(member) {
      var members = currentMemberList();
      var index = members.indexOf(member);
      members.splice(index, 1);
    }

    function removeDuplicatesFromArray(array) {
      var object = {}, newArray = [];
      for(var i = 0; i < array.length; i++) {
        var element = object[array[i].email];
        var check = element && (element.invite || element.sessionMember);

        if(!check) {
          object[array[i].email] = array[i];
        }
      }

      for(var i in object) {
        newArray.push(object[i]);
      }

      return newArray;
    }

    function selectMembers(listId, members) {
      var selected = [];
      for(var i in members) {
        var member = members[i];
        if(member._selected) {
          member.listId = listId;
          selected.push(member);
        }
      }
      return selected;
    }

    function sendGenericEmail() {
      var data = findSelectedMembers();

      if(data.length > 0) {
        vm.session.sendGenericEmail(data).then(function(res) {
          messenger.ok(res.message);
        }, function(error) {
          messenger.error(error);
        });
      }
      else {
        messenger.error('No contacts selected');
      }
    }

  }
})();
