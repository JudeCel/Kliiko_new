(function () {
  'use strict';

  angular.module('KliikoApp').controller('SessionStep4-5Controller', LastSessionStepController);

  LastSessionStepController.$inject = ['dbg', 'step1Service', 'sessionBuilderControllerServices', 'messenger', 'SessionModel','$state', '$stateParams', '$filter', 'domServices',  '$q', '$window', '$rootScope', '$scope', 'angularConfirm', 'messagesUtil'];
  function LastSessionStepController(dbg, step1Service, builderServices, messenger, SessionModel, $state, $stateParams, $filter, domServices, $q, $window,  $rootScope, $scope, angularConfirm, messagesUtil) {
    dbg.log2('#SessionBuilderController 4-5 started');

    var vm = this;

    vm.beforeEditInviteStatus = '';
    vm.accordions = {};
    vm.participants = [];
    vm.observers = [];
    vm.editContactIndex = null;
    vm.contactData = {};
    vm.canSendSMS = false;

    vm.currentFilter = 'all';
    vm.filterTypes = {
      all: 'All',
      notInvited: 'Not Invited',
      confirmed: 'Confirmed',
      inProgress: 'Confirmed',
      notThisTime: 'Not This Time',
      notAtAll: 'Not At All',
      pending: 'No Response',
    };

    // step 4 + 5
    vm.showCorrectStatus = showCorrectStatus;
    vm.inviteMembers = inviteMembers;
    vm.modalWindowHandler = modalWindowHandler;
    vm.selectedAllMembers = selectedAllMembers;
    vm.findSelectedMembers = findSelectedMembers;
    vm.removeFromList = removeFromList;
    vm.sendGenericEmail = sendGenericEmail;
    vm.setMembersFilter = setMembersFilter;
    vm.fixInviteStatus = fixInviteStatus;
    vm.openEditContactModal = openEditContactModal;
    vm.updateContact = updateContact;
    vm.returnMemberInviteStatus = returnMemberInviteStatus;
    vm.closeEditContactForm = closeEditContactForm;

    vm.stepMembers = [];

    vm.isParticipantPage = function() {
      return vm.session.sessionData.step == "manageSessionParticipants";
    }

    vm.prepareData = function(participants, observers) {
      if(vm.previousStep != vm.session.sessionData.step) {
        vm.previousStep = vm.session.sessionData.step;
        vm.currentFilter = 'all';
      }

      if (vm.isParticipantPage()) {
        vm.stepMembers = participants;
      } else {
        vm.stepMembers = observers;
      }

      return vm.stepMembers;
    }

    vm.initStep = function(participants) {
      var deferred = $q.defer();

      vm.session = builderServices.session;
      vm.canSendSMS = vm.session.steps.step1.type != 'forum';
      vm.mouseOveringMember = [];

      if (vm.isParticipantPage()) {
        if(participants.length == 0 && vm.stepMembers.length == 0) {
          updateParticipantsList(null);
        }

        vm.stepMembers = vm.session.steps.step4.participants;
        vm.pageTitle = "Participants";
        deferred.resolve();
      } else {
        vm.stepMembers = vm.session.steps.step5.observers;
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

    function updateParticipantsList(value) {
      vm.session.sessionData.participantListId = value;
      vm.session.updateStep({ participantListId: value }).then(function(res) {
      }, function (error) {
        messenger.error(error);
      });
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

    function fixInviteStatus(status) {
      return status.split(/(?=[A-Z])/).join(' ').toLowerCase();
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
        messenger.error(messagesUtil.sessionBuilder.noContacts);
      }
    }

    function showSmsWindow(data) {
      if(data.length > 0) {
        var noMobile = {};
        for(var i in data) {
          var member = data[i];
          if(!member.mobile) {
            noMobile[member.firstName + ' ' + member.lastName] = messagesUtil.sessionBuilder.noMobile;
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
        messenger.error(messagesUtil.sessionBuilder.noContacts);
      }
    }

    function modalWindowHandler(modal, data) {
      if (vm.canSendSMS) {
        if(modal === 'showSms') {
          showSmsWindow(data);
        } else if(modal === 'sendSms') {
          vm.session.sendSms(vm.sendSmsTo, vm.sendSmsMessage).then(function(message) {
            domServices.modal('sessionBuilder-sendSmsModal', 'close');
            messenger.ok(message);
          }, function(error) {
            messenger.error(error);
          });
        }
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

    function removeFromList(member) {
      if(member.inviteStatus == 'Not Invited') {
        removeMemberFromList(member);
      }
      else {
        angularConfirm('Are you sure you want to do this?').then(function(response) {
          vm.session.removeMember(member).then(function(res) {
            removeMemberFromList(member);
            messenger.ok(res.message);
          }, function(error) {
            messenger.error(error);
          });
        });
      }
    }

    function removeMemberFromList(member) {
      var members = builderServices.currentMemberList(vm);
      var index = members.indexOf(member);
      members.splice(index, 1);
      if(members.length == 0) {
        updateParticipantsList(null);
      }
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
        messenger.error(messagesUtil.sessionBuilder.noContacts);
      }
    }

    function setMembersFilter(filter) {
      vm.currentFilter = filter;
    }

    function openEditContactModal(object) {
      vm.beforeEditInviteStatus = object.inviteStatus;

      vm.editContactIndex = vm.stepMembers.indexOf(object);
      angular.copy(object, vm.contactData);
      domServices.modal('editContactForm');
    }

    function updateContact() {
      var params = {defaultFields: vm.contactData};

      step1Service.updateContact(params).then(function(res) {
        angular.copy(mapCorrectData(res.data), vm.stepMembers[vm.editContactIndex]);
        messenger.ok(res.message);
        closeEditContactForm();
      }, function (error) {
        messenger.error(error);
      })
    }

    function mapCorrectData(object) {
      return {
        accountUserId: object.accountUserId,
        postalAddress: object.postalAddress,
        city: object.city,
        companyName: object.companyName,
        country: object.country,
        email: object.email,
        firstName: object.firstName,
        gender: object.gender,
        id: object.id,
        landlineNumber: object.landlineNumber,
        lastName: object.lastName,
        mobile: object.mobile,
        postCode: object.postCode,
        state: object.state
      }
    }

    function closeEditContactForm() {
      domServices.modal('editContactForm', 'close');
      vm.contactData = {};
    }

    function returnMemberInviteStatus(member) {
      if(vm.beforeEditInviteStatus) {
        member.inviteStatus = vm.beforeEditInviteStatus;
      }else if(member.inviteStatus){
        // Do Nothing
      }else if(member.invite) {
        member.inviteStatus = member.invite.status;
      }else{
        member.inviteStatus = "confirmed";
      }

      return member.inviteStatus;
    }

  }

})();
