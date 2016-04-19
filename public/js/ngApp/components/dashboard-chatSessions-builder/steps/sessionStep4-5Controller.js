(function () {
  'use strict';

  angular.module('KliikoApp').controller('SessionStep4-5Controller', LastSessionStepController);

  LastSessionStepController.$inject = ['dbg', 'sessionBuilderControllerServices', 'messenger', 'SessionModel','$state', '$stateParams', '$filter', 'domServices', '$ocLazyLoad', '$q', '$window', '$rootScope', '$scope'];
  function LastSessionStepController(dbg, builderServices, messenger, SessionModel, $state, $stateParams, $filter, domServices, $ocLazyLoad, $q, $window,  $rootScope, $scope) {
    dbg.log2('#SessionBuilderController 4-5 started');

    var vm = this;

    vm.accordions = {};
    vm.participants = [];
    vm.observers = [];

    vm.participantsFilterType = {all:true};
    vm.observersFilterType = {all:true};

    // step 4 + 5
    vm.showCorrectStatus = showCorrectStatus;
    vm.inviteMembers = inviteMembers;
    vm.modalWindowHandler = modalWindowHandler;
    vm.finishSelectingMembers = finishSelectingMembers;
    vm.selectedAllMembers = selectedAllMembers;
    vm.findSelectedMembers = findSelectedMembers;
    vm.removeFromList = removeFromList;
    vm.sendGenericEmail = sendGenericEmail;
    vm.setMembersFilter = setMembersFilter;

    vm.stepMembers = [];

    vm.isParticipantPage = function() {
      return vm.session.sessionData.step == "manageSessionParticipants";
    }

    vm.prepareData = function(participants, observers) {
      if (vm.isParticipantPage()) {
        vm.stepMembers = participants;
      } else {
        vm.stepMembers = observers;
      }

      return vm.stepMembers;
    }

    vm.initStep = function(step) {
      var deferred = $q.defer();

      vm.session = builderServices.session;
      vm.mouseOveringMember = [];
      if (vm.isParticipantPage()) {
        vm.participants = vm.session.steps.step4.participants;
      } else {
        vm.participants = vm.session.steps.step5.observers;
      }

      if (vm.isParticipantPage()) {
        vm.pageTitle = "Participants";
        deferred.resolve();
      }
      else {
        vm.lastStep = true;
        vm.pageTitle = "Observers";
        deferred.resolve();
      }

      return deferred.promise;
    }
    function faderHack() {
      setTimeout(function() {
        jQuery('.modal-backdrop.fade.in').hide();
      }, 10);
    }

    /// step 4 + 5
    function showCorrectStatus(member) {
      if(member.sessionMember) {
        return 'confirmed';
      }
      else {
        return member.status;
      }
    }

    function inviteMembers() {
     var data = findSelectedMembers();

      if(data.length > 0) {
        var promise;
        if (vm.isParticipantPage()) {
          promise = vm.session.inviteParticipants(data);
        }
        else {
          promise = vm.session.inviteObservers(data);
        }

        promise.then(function(res) {

          for(var i in data) {
            var member = data[i];
             for(var j in res.data) {
               if (member.email == res.data[j].email) {
                  data[i] = angular.extend(member, res.data[j]);
                  member.isSelected = false;
                  member.inviteStatus = res.data[j].invite.status
               }
             }
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

    function selectedAllMembers() {
      var members = builderServices.currentMemberList(vm);
      for(var i in members) {
        var member = members[i];
        if(!showCorrectStatus(member)) {
           member.isSelected = vm.selectedAll;
        }
      }
    }

    function findSelectedMembers() {
      return builderServices.findSelectedMembers(vm);
    }

    function finishSelectingMembers(activeList) {
      if (vm.searchingParticipants) {
        vm.participants = vm.participants.concat(builderServices.selectMembers(activeList.id, activeList.members));
        vm.participants = builderServices.removeDuplicatesFromArray(vm.participants);
        vm.searchingParticipants = false;
      }

      if (vm.searchingObservers) {
        vm.observers = vm.observers.concat(builderServices.selectMembers(activeList.id, activeList.members));
        vm.observers = builderServices.removeDuplicatesFromArray(vm.observers);
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
          removeMemberFromList(member);
          messenger.error(error);
        });
      }
    }

    function removeMemberFromList(member) {
      var members = builderServices.currentMemberList(vm);
      var index = members.indexOf(member);
      members.splice(index, 1);
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

    function setMembersFilter(filterName) {
      var memberType = vm.session.sessionData.step == "manageSessionParticipants" ? "participants" : "observers";
      var filter = {};
      filterName.length
        ? filter[filterName] = true
        : filter['all'] = true;
      vm[memberType+'FilterType'] = filter;
    }


  }

})();
