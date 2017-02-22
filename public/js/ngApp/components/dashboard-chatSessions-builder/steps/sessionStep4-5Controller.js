(function () {
  'use strict';

  angular.module('KliikoApp').controller('SessionStep4-5Controller', LastSessionStepController);

  LastSessionStepController.$inject = ['dbg', 'step1Service', 'sessionBuilderControllerServices', 'messenger', 'SessionModel','$state', '$stateParams', '$filter', 'domServices',  '$q', '$window', '$rootScope', '$scope', 'angularConfirm', 'messagesUtil', '$confirm', 'socket'];
  function LastSessionStepController(dbg, step1Service, builderServices, messenger, SessionModel, $state, $stateParams, $filter, domServices, $q, $window,  $rootScope, $scope, angularConfirm, messagesUtil, $confirm, socket) {
    dbg.log2('#SessionBuilderController 4-5 started');

    var vm = this;
    vm.SocketChannel = null;
    vm.beforeEditInvite = null;
    vm.accordions = {};
    vm.participants = [];
    vm.observers = [];
    vm.editContactIndex = null;
    vm.contactData = {};
    vm.canSendSMS = false;

    vm.currentFilter = 'all';
    vm.filterTypes = {
      waiting: "Sending, please wait...",
      failed: "Sending failed",
      sentDone: "Invitation Sent",
      all: 'All',
      notInvited: 'Not Invited',
      confirmed: 'Accepted',
      notThisTime: 'Not This Time',
      notAtAll: 'Not At All',
      pending: 'No Response',
      sessionFull: 'Session Full'
    };
    vm.maxCommentLength = 100;

    // step 4 + 5
    vm.removeInvite = removeInvite;
    vm.inviteMembers = inviteMembers;
    vm.sendCloseEmail = sendCloseEmail;
    vm.modalWindowHandler = modalWindowHandler;
    vm.selectedAllMembers = selectedAllMembers;
    vm.findSelectedMembersSMS = findSelectedMembersSMS;
    vm.findSelectedMembersGenericEmail = findSelectedMembersGenericEmail;
    vm.findSelectedMembersInvite = findSelectedMembersInvite;
    vm.findSelectedMembersClose = findSelectedMembersClose;
    vm.removeFromList = removeFromList;
    vm.sendGenericEmail = sendGenericEmail;
    vm.setMembersFilter = setMembersFilter;
    vm.fixInviteStatus = fixInviteStatus;
    vm.openEditContactModal = openEditContactModal;
    vm.updateContact = updateContact;
    vm.returnMemberInviteStatus = returnMemberInviteStatus;
    vm.closeEditContactForm = closeEditContactForm;
    vm.canSelectMember = canSelectMember;
    vm.rateMember = rateMember;
    vm.openCommentModalWindow = openCommentModalWindow;
    vm.saveComment = saveComment;
    vm.showSpinner = showSpinner;

    vm.stepMembers = [];
    vm.emailSentFailedTooltip = "Sorry, failed to send your email. Please check for typos in the email address, or refer to this <a>Help Topic</a>";

    vm.isParticipantPage = function() {
      return vm.session.currentStep == "manageSessionParticipants";
    }

    vm.isObserverPage = function() {
      return vm.session.currentStep == "inviteSessionObservers";
    }

    vm.canSendSMSOnThisPage = function() {
      return vm.isParticipantPage() && vm.canSendSMS;
    }

    vm.getCurrentFilter = function(canSendCloseEmail) {
      if (canSendCloseEmail) {
        var res = !vm.filterInited ? undefined : { inviteStatus: 'confirmed' };
        vm.filterInited = true;
        return res;
      } else {
        return vm.currentFilter == 'all' ? undefined : { inviteStatus: vm.currentFilter };
      }
    }

    vm.prepareData = function(sbc) {

      if(vm.previousStep != vm.session.sessionData.step) {
        vm.previousStep = vm.session.sessionData.step;
        vm.currentFilter = 'all';
      }

      if (vm.isParticipantPage()) {
        if(sbc.isSessionClosed()){
          vm.stepMembers = sbc.session.steps.step4.participants;
        }else{
          vm.stepMembers = sbc.participants;
        }
        vm.inviteEnabled = sbc.session.steps.step4.canInviteMembers;
        vm.inviteMembersError = sbc.session.steps.step4.inviteMembersError;
      } else if (vm.isObserverPage()) {
        if(sbc.isSessionClosed()){
          vm.stepMembers = sbc.session.steps.step5.observers;
        }else{
          vm.stepMembers = sbc.observers;
        }
        vm.inviteEnabled = sbc.session.steps.step5.canInviteMembers;
        vm.inviteMembersError = sbc.session.steps.step5.inviteMembersError;
      } else {
        vm.stepMembers = [];
      }
      return vm.stepMembers;
    }

    vm.initStep = function() {
      var deferred = $q.defer();

      vm.session = builderServices.session;
      vm.canSendSMS = vm.session.steps.step1.type != 'forum';
      vm.mouseOveringMember = [];

      if (vm.isParticipantPage()) {
        vm.stepMembers = vm.session.steps.step4.participants;
        vm.pageTitle = "Guests";
      } else {
        vm.stepMembers = vm.session.steps.step5.observers;
        vm.lastStep = true;
        vm.pageTitle = "Spectators";
      }
      socket.sessionsBuilderChannel($scope, vm.session.id, function(channel) {
        vm.SocketChannel = channel;
        bindSocketEvents();
        deferred.resolve();
      })

      return deferred.promise;
    }
    function faderHack() {
      setTimeout(function() {
        jQuery('.modal-backdrop.fade.in').hide();
      }, 10);
    }

    function updateInviteItem(resp) {
    $scope.$evalAsync(
      function( $scope ) {
        vm.stepMembers.map(function(item) {
          if(item.id == resp.accountUserId) {
            angular.copy(resp, item.invite);
          }
        })
      });
    }

    function bindSocketEvents() {
      vm.SocketChannel.off("inviteUpdate");
      vm.SocketChannel.off("inviteDelete");

      vm.SocketChannel.on("inviteUpdate", function(resp) {
        vm.stepMembers.map(function(item) {
          if(item.id == resp.accountUserId) {
            item.invite = (item.invite || {});
            if (item.invite.emailStatus == 'waiting' && resp.emailStatus == "sent") {
              resp.emailStatus = "sentDone"

              setTimeout(function() {
                resp.emailStatus = "sent"
                updateInviteItem(resp);
              }, 2000);
            }
            item.isSelected = false;
            updateInviteItem(resp);

            return false;
          }
        });
      });

      vm.SocketChannel.on("inviteDelete", function(resp) {
        vm.stepMembers.map(function(item) {
          if(item.invite && item.invite.id == resp.id) {
            item.invite = null;
          }
        });

        if(!$scope.$$phase) {
          $scope.$apply();
        }
      });
    }

    function showSpinner(member) {
      return member.invite && member.invite.emailStatus == 'waiting'
    }

    function updateParticipantsList(value) {
      vm.session.updateStep({ participantListId: value }, vm.session).then(function(res) {
        if (!res.ignored) {
          vm.session.sessionData.participantListId = value;
        }
      }, function (error) {
        messenger.error(error);
      });
    }

    function fixInviteStatus(status) {
      return status.split(/(?=[A-Z])/).join(' ').toLowerCase();
    }

    function sendCloseEmail() {
      var data = findSelectedMembersClose();
      if (data.length > 0) {
        $confirm({ text: "Are you sure you want to send Close Email to Selected Guests?", title: "Send Close Email to Selected Guests?", wide: true }).then(function() {
          vm.session.sendCloseEmail(data).then(function(res) {
            for(var i=0; i<data.length; i++) {
              data[i].closeEmailSentStatus = "Sent";
              data[i].isSelected = false;
            }
            messenger.ok(res.message);
          }, function(error) {
            messenger.error(error);
          });
        });
      } else {
        messenger.error(messagesUtil.sessionBuilder.noContacts);
      }
    }

    function performInvite() {
      var data = findSelectedMembersInvite();

      if(data.length > 0) {
        var promise;

        if (vm.isParticipantPage()) {
          promise = vm.session.inviteParticipants(data);
        } else {
          promise = vm.session.inviteObservers(data);
        }

        promise.then(function(res) {
          for(var i in data) {
            var member = data[i];
             for(var j in res.data) {
               if (member.id == res.data[j].accountUserId) {
                  member.invite = res.data[j];
                  member.isSelected = false;
                  data[i] = angular.extend(member, data[i]);
                  break;
               }
             }
          }
          messenger.ok(res.message);
        }, function(error) {
          $confirm({ text: error, title: 'Sorry', closeOnly: true, showAsError: true });
        });
      } else {
        var someMembersWereSelected = builderServices.someMembersWereSelected(vm);
        messenger.error(someMembersWereSelected ? messagesUtil.sessionBuilder.noContactsToInvite : messagesUtil.sessionBuilder.noContacts);
      }
    }

    function inviteMembers() {
      if (vm.inviteEnabled) {
        performInvite();
      } else {
        $confirm({ text: vm.inviteMembersError, title: 'Sorry', closeOnly: true, showAsError: true });
      }
    }

    function showSmsWindow(data) {
      if (data.length > 0) {
        var noMobile = 0;
        for (var i in data) {
          var member = data[i];
          if (!member.mobile) {
            noMobile++;
          }
        }

        if (noMobile == 0) {
          vm.sendSmsTo = data;
          vm.sendSmsMessage = null;
          domServices.modal('sessionBuilder-sendSmsModal');
        } else if (noMobile == 1) {
          messenger.error(messagesUtil.sessionBuilder.noMobileForContact);
        } else {
          messenger.error(noMobile.toString() + messagesUtil.sessionBuilder.noMobileForContacts);
        }
      } else {
        var someMembersWereSelected = builderServices.someMembersWereSelected(vm);
        messenger.error(someMembersWereSelected ? messagesUtil.sessionBuilder.noContactsToSendSMS : messagesUtil.sessionBuilder.noContacts);
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
        members[i].isSelected = vm.selectedAll && canSelectMember(members[i]);
      }
    }

    function canSelectMember(member) {
      return vm.session.sessionData.status == "open" || vm.session.currentStep == "inviteSessionObservers" ||
        member.inviteStatus == "confirmed" && member.closeEmailSentStatus != "Sent";
    }

    function findSelectedMembersGenericEmail() {
      return builderServices.findSelectedMembers(vm, false, false, false);
    }

    function findSelectedMembersSMS() {
      return builderServices.findSelectedMembers(vm, false, false, true);
    }

    function findSelectedMembersInvite() {
      return builderServices.findSelectedMembers(vm, true, !activeMembersLimitReached(), false);
    }

    function findSelectedMembersClose() {
      return builderServices.findSelectedMembers(vm, false, false, false);
    }

    function removeInvite() {
      vm.session.removeMember(vm.currentMemberModal).then(function(res) {
        removeMemberFromList(vm.currentMemberModal);
        vm.currentMemberModal = null;
        domServices.modal(null, null, true);
        messenger.ok(res.message);
      }, function(error) {
        domServices.modal('confirmInviteRemoveModal', true);
        domServices.modal('rejectedInviteRemoveModal');
      });
    }

    function removeFromList(member) {
      if(returnMemberInviteStatus(member) == 'notInvited') {
        removeMemberFromList(member);
      } else {
        vm.currentMemberModal = member;
        if (vm.isObserverPage()) {
          domServices.modal('confirmInviteRemoveObserverModal');
        }else {
          domServices.modal('confirmInviteRemoveModal');
        }
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
      var data = findSelectedMembersGenericEmail();

      if (data.length > 0) {
        vm.session.sendGenericEmail(data).then(function(res) {
          if (res.genericTemplateNotCreated) {
            $confirm({ text: "You need to set up a Generic Email in Step 3 before you can send to your Contacts", closeOnly: true, title: null });
          } else {
            messenger.ok(res.message);
          }
        }, function(error) {
          messenger.error(error);
        });
      } else {
        messenger.error(messagesUtil.sessionBuilder.noContacts);
      }
    }

    function setMembersFilter(filter) {
      vm.currentFilter = filter;
    }

    function openEditContactModal(object) {
      vm.beforeEditInvite = object.invite;

      vm.editContactIndex = vm.stepMembers.indexOf(object);
      angular.copy(object, vm.contactData);
      domServices.modal('editContactForm');
    }

    function updateContact() {
      var params = {defaultFields: vm.contactData};

      step1Service.updateContact(params).then(function(res) {
        angular.copy(mapCorrectData(res.data), vm.stepMembers[vm.editContactIndex]);
        vm.stepMembers[vm.editContactIndex].id = res.data.accountUserId;
        vm.stepMembers[vm.editContactIndex].invite = vm.beforeEditInvite;
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
      vm.beforeEditInvite = null;
    }

    vm.getMembersStatusTranscription = function(member) {
      return vm.filterTypes[returnMemberInviteStatus(member)];
    }

    vm.getMembersCloseEmailSentTranscription = function(member) {
      return returnMemberCloseEmailSentStatus(member)
    }

    function activeMembersLimitReached() {
      if (vm.session.steps.step1.type == 'focus' && vm.isParticipantPage()) {
        var count = 0;
        for (var i=0; i<vm.stepMembers.length; i++) {
          var member = vm.stepMembers[i];
          if (member.inviteStatus == "confirmed" || member.inviteStatus == "inProgress") {
            count++;
            if (count == 8) {
              return true;
            }
          }
        }
      }
      return false;
    }

    vm.disableSessionFullMember = function(member) {
      return member.inviteStatus == "sessionFull" && activeMembersLimitReached();
    }

    vm.memberDisabled = function(member) {
      return vm.session.sessionData.status == "closed" && member.closeEmailSentStatus == "Sent"
    }

    function returnMemberCloseEmailSentStatus(member) {
      if (member.closeEmailSentStatus) {
        return member.closeEmailSentStatus;
      } else {
        var closeEmailSentStatus = "Not Sent";
        var status = returnMemberInviteStatus(member);
        if (status == "confirmed" && member.sessionMember) {
          closeEmailSentStatus = member.sessionMember.closeEmailSent ? "Sent" : "Not Sent";
        }
        member.closeEmailSentStatus = closeEmailSentStatus;
        return closeEmailSentStatus;
      }
    }

    function returnMemberInviteStatus(member) {
      if (member.invite) {
        switch (member.invite.emailStatus) {
          case 'sent':
            if (member.invite.status == "inProgress" ) {
              member.inviteStatus = "pending";
            }else{
              member.inviteStatus = member.invite.status;
            }
            break;
          default:
            member.inviteStatus = member.invite.emailStatus;
        }
      } else {
        member.inviteStatus = "notInvited"
      }
      return member.inviteStatus;
    }

    function rateMember(member) {
      builderServices.rateSessionMember({ id: member.sessionMember.id, rating: member.sessionMember.rating }).then(function(res) {
        if (res.error) {
          messenger.error(res.error);
        }
      });
    };

    function openCommentModalWindow(member) {
      vm.currentMemberModal = member;
      domServices.modal('memberCommentModal');
    }

    function saveComment() {
      builderServices.saveComment(vm.currentMemberModal.sessionMember).then(function(res) {
        if (res.error) {
          messenger.error(res.error);
        } else {
          messenger.ok(res.message);
          vm.currentMemberModal = null;
          domServices.modal('memberCommentModal', 1);
        }
      });
    }

  }
})();
