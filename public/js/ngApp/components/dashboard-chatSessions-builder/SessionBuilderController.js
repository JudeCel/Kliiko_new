(function () {
  'use strict';

  angular.module('KliikoApp').controller('SessionBuilderController', SessionBuilderController);

  SessionBuilderController.$inject = ['dbg', 'sessionBuilderControllerServices', 'messenger', 'SessionModel','$state', '$stateParams', '$filter', 'domServices',  '$q', '$window', 'ngProgressFactory', '$rootScope', '$scope', 'chatSessionsServices', 'goToChatroom', 'messagesUtil', '$confirm', 'socket', 'infoMessenger'];
  function SessionBuilderController(dbg, builderServices, messenger, SessionModel, $state, $stateParams, $filter, domServices,  $q, $window, ngProgressFactory,  $rootScope, $scope, chatSessionsServices, goToChatroom, messagesUtil, $confirm, socket, infoMessenger) {
    dbg.log2('#SessionBuilderController started');

    var vm = this;
    var intervals = {};
    var sessionId = $stateParams.id;
    vm.basePath = '/js/ngApp/components/dashboard-chatSessions-builder/';
    vm.$state = $state;

    vm.session = new SessionModel(sessionId);
    builderServices.session = vm.session;
    builderServices.mainController = vm;

    vm.session.init().then(function(res) {
      if (!$stateParams.id) {
        //Next block replaced with 'location.replace' fix back button (DE909). Can be removed after tests.
        /*$state.go('account-hub.chatSessions.builder', {id: vm.session.id}, {
          location: true, inherit: false, notify: false, reload:false
        });*/
        location.replace(location.href + vm.session.id);
      }

      vm.participants = vm.session.steps.step4.participants;
      vm.observers = vm.session.steps.step5.observers;
      vm.currentStep = -1;
      initStep().then(function (step) {
        vm.currentStep = step;
      });

      subscribeCannel();
    }, function (error) {
      window.history.back();
      messenger.error(error);
      setTimeout(function () {
        messenger.changeSkip(false);
      }, 100);
    });

    vm.closeSession = closeSession;
    vm.openSession = openSession;
    vm.stepsClassIsActive = stepsClassIsActive;
    vm.updateStep = updateStep;
    vm.goToStep = goToStep;
    vm.goToNextStep = goToNextStep;
    vm.goToPreviousStep = goToPreviousStep;
    vm.finishSessionBuilder = finishSessionBuilder;
    vm.goToChat = goToChat;
    vm.canSeeGoToChat = canSeeGoToChat;
    vm.currentPageToDisplay = currentPageToDisplay;
    vm.addFacilitatorsClickHandle = addFacilitatorsClickHandle;

    vm.faderHack = faderHack;

    vm.finishSelectingMembers = finishSelectingMembers;
    vm.selectParticipantsClickHandle = selectParticipantsClickHandle;
    vm.selectObserversClickHandle = selectObserversClickHandle;
    vm.isSelectObserverStep = isSelectObserverStep;
    vm.isSelectParticipantStep = isSelectParticipantStep;
    vm.isSessionClosed = isSessionClosed;
    vm.canSendCloseEmail = canSendCloseEmail;
    vm.canCommentAndRate = canCommentAndRate;
    vm.canInvite = canInvite;
    vm.showOkMark = showOkMark;

    var stepNames = ["setUp", "facilitatiorAndTopics", "manageSessionEmails", "manageSessionParticipants", "inviteSessionObservers"];

    var currentState = { };
    vm.onlineUsers = [];
    vm.lastOnlineUsersDumpForMessage = [];

    function subscribeCannel() {
      socket.sessionsBuilderChannel(vm.session.id, function(channel) {

        function syncState(state) {
          if (state) {
            currentState = Phoenix.Presence.syncState(currentState, state, onJoin(state), onLeave(state));
          }
        }

        function syncDiff(diff) {
          if (diff) {
            currentState = Phoenix.Presence.syncDiff(currentState, diff, onJoin(diff), onLeave(diff));
          }
        }

        function onJoin(state) {
          return function(id, current, newPres) {
            if (!current) {
             vm.onlineUsers.push(newPres.accountUser);
             whenNewUserInSessionBuilder();
            }
          }
        }

        function onLeave(state) {
          return function(id, current, leftPres) {
            //if current.metas exists than user has other instances opened
            //https://hexdocs.pm/phoenix/Phoenix.Presence.html
            if (current.metas.length == 0) {
              for (var i=0; i<vm.onlineUsers.length; i++) {
                if (vm.onlineUsers[i].id == current.accountUser.id) {
                  vm.onlineUsers.splice(i, 1);
                  break;
                }
              }
            }
          }
        }

        channel.on("presence_state", function(state) {
          syncState(state);
        });

        channel.on("presence_diff", function(diff) {
          syncDiff(diff);
        });

      });
    }

    function isSameOnlineUsersDumpForMessage(newDump) {
      return newDump.length == vm.lastOnlineUsersDumpForMessage.length && newDump.every(function(element, index) {
        return element == vm.lastOnlineUsersDumpForMessage[index]; 
      });
    }

    function whenNewUserInSessionBuilder() {
      if (vm.onlineUsers.length > 1) {
        var message = "";
        var onlineUsersDump = [];
        for (var i=0; i<vm.onlineUsers.length; i++) {
          if (message != "") {
            message += ", ";
          }
          message += vm.onlineUsers[i].firstName + " " + vm.onlineUsers[i].lastName;
          onlineUsersDump.push(vm.onlineUsers[i].id);
        }
        onlineUsersDump.sort();
        if (!isSameOnlineUsersDumpForMessage(onlineUsersDump)) {
          vm.lastOnlineUsersDumpForMessage = onlineUsersDump;
          message += " are currently editing this Session";
          infoMessenger.message(message);
        }
      }
    }

    function closeSession() {
      if (vm.session.sessionData.showStatus != 'Pending' && vm.session.sessionData.showStatus != 'Closed') {
        $confirm({ text: "Do you want to Close this Chat Session? You will be able to send the Close Email to Guests, and make Comments." }).then(function() {
          vm.session.setOpen('closed').then(function(res) {
            initStep().then(function (step) {
              vm.currentStep = step;
            });
          }, function(err) {
            messenger.error(err);
          });
        });
      }
    }

    function openSession() {
      if (vm.session.sessionData.showStatus == 'Closed') {
        $confirm({ text: "Do you want to Re-Open this Chat Session?" }).then(function() {
          vm.session.setOpen('open').then(function(res) {
            initStep().then(function (step) {
              vm.currentStep = step;
            });
          }, function(err) {
            messenger.error(err);
          });
        });
      }
    }

    function goToNextStep() {
      goToStep(vm.currentStep + 1);
    }

    function goToPreviousStep() {
      goToStep(vm.currentStep - 1);
    }

    function goToStep(step) {
      vm.listIgnoring = null;
      var routerProgressbar = ngProgressFactory.createInstance();
      routerProgressbar.start();

      vm.session.goCertainStep(step).then(function(result) {
        handleStepSwitch(result, step);
        routerProgressbar.complete();
      }, function(error) {
        routerProgressbar.complete();
        messenger.error(error);
      });
    }

    function finishSessionBuilder() {
      $state.go('account-hub.chatSessions');
    }

    function handleStepSwitch(result, step) {
      var session = result.data.sessionBuilder;
       vm.session.steps = session.steps;

      for (var i = vm.currentStep; i < step; i++) {
        var stepPropertyName = "step" + i;
        if (session.steps[stepPropertyName].error) {
          messenger.error(session.steps[stepPropertyName].error);
        }
      }

      initStep().then(function(stepNumber) {
        vm.searchingParticipants = false;
        vm.searchingObservers = false;
        vm.currentStep = stepNumber;
      });
    }

    function showOkMark(step) {
      return isValidStep(step) && isNotActiveStep(step);
    }

    function isValidStep(step) {
      var stepPropertyName = "step" + step;
      return vm.session.steps && vm.session.steps[stepPropertyName].error == null;
    }

    function isNotActiveStep(step) {
      return  vm.currentStep !== step;
    }

    function goToChat(session) {
      if (session.showStatus && session.showStatus == 'Expired') return;

      vm.disableRedirectButton = true;
      goToChatroom.go(session.id).then(function(url) {
        vm.disableRedirectButton = false;
      }, function(error) {
        vm.disableRedirectButton = false;
      });
    }

    function canSeeGoToChat(accountUser) {
      var sessionData = vm.session.sessionData;

      if(sessionData) {
        var facilitator = false, member = false, topics = false, membersArray = sessionData.SessionMembers, different;

        if(sessionData.facilitator) {
          facilitator = sessionData.facilitator.accountUserId == accountUser.id;
        }
        else if(sessionData.steps && sessionData.steps.step1.facilitator) {
          different = true;
          membersArray = sessionData.steps.step4.participants.concat(sessionData.steps.step5.observers);
          facilitator = sessionData.steps.step1.facilitator.id == accountUser.id;
        }

        if(membersArray) {
          membersArray.map(function(sessionMember) {
            if(different) {
              if(sessionMember.id == accountUser.id) {
                member = true;
              }
            }
            else {
              if(sessionMember.accountUserId == accountUser.id) {
                member = true;
              }
            }
          });
        }

        if(vm.session.steps.step2.topics.length > 0) {
          topics = true;
        }

        return (facilitator || member) && topics;
      }
      else {
        return false;
      }
    }


    function initStep() {
      var deferred = $q.defer();

      if (!$stateParams.id) {
        $state.go('account-hub.chatSessions.builder', {id: vm.session.id}, {
          location: true, inherit: false, notify: false, reload:false
        });
      }

      vm.lastStep = null;
      showExpiresWarning();

      if (vm.session.sessionData.step == "facilitatiorAndTopics") {
        deferred.resolve(2);
      }
      else if (vm.session.sessionData.step == "manageSessionEmails") {
        deferred.resolve(3);
      }
      else if (vm.session.sessionData.step == "manageSessionParticipants") {
        deferred.resolve(4);
      }
      else if (vm.session.sessionData.step == "inviteSessionObservers") {
        vm.lastStep = true;
        deferred.resolve(5);
      } else {
        deferred.resolve(1);
      }

      return deferred.promise;

      function showExpiresWarning() {
        if (vm.session.sessionData && vm.session.sessionData.endTime) {
          vm.expireWarning = builderServices.getExpireDays(vm.session.sessionData.endTime);
        }
      }
    }

    function stepsClassIsActive(step) {
      return (vm.currentStep == step);
    }

    function updateStep(dataObj) {
        vm.session.updateStep(dataObj, vm.session).then(null, function (err) {
          messenger.error(err);
        }
      );
    }

    function currentPageToDisplay() {
      var path = "";
      if ( vm.showContactsList || vm.searchingParticipants || vm.searchingObservers ) {
        vm.hideStuff = true;
        return vm.basePath+'steps/contactLists.html';
      }

      vm.hideStuff = false;
      if (vm.currentStep) {
        if(vm.currentStep == 4 || vm.currentStep == 5) {
          path = vm.basePath+'steps/step4-5.tpl.html';
        } else if (vm.currentStep != -1){
          path = vm.basePath + 'steps/step' + vm.currentStep + '.tpl.html';
        }
      }

      return path;
    }

    function addFacilitatorsClickHandle() {
      vm.showContactsList = true;
    }

    function faderHack() {
      setTimeout(function() {
        jQuery('.modal-backdrop.fade.in').hide();
      }, 10);
    }

    function selectParticipantsClickHandle() {
      var id = vm.session.sessionData.participantListId;
      if(id) {
        vm.listIgnoring = { include: true, active: { id: id }, ids: [id] };
      }
      else {
        vm.listIgnoring = false;
      }

      vm.searchingParticipants = true;
    }

    function selectObserversClickHandle() {
      builderServices.canAddObservers().then(function(res) {
        if(res.error) {
          messenger.error(res.error);
        }else{
          vm.searchingObservers = true;
        }
      });
    }

    function mapToAccountUser(list){
      return list.map(function(i) {
        return {
          id: i.accountUserId,
          firstName: i.firstName,
          lastName: i.lastName,
          email: i.email,
          invite: null,
        }
      })
    }

    function addParticipantsFromList(list) {
      vm.participants = vm.participants.concat(mapToAccountUser(list));
      vm.participants = builderServices.removeDuplicatesFromArray(vm.participants);
    }

    function finishSelectingMembers(activeList) {
      if (!activeList) {
        vm.searchingParticipants = false;
        vm.searchingObservers = false;
        return;
      }

      var list = builderServices.selectMembers(activeList.id, activeList.members);

      if (vm.searchingParticipants) {
        if (list.length > 0) {
          if (!vm.session.sessionData.participantListId) {
            vm.session.updateStep({ participantListId: activeList.id }, vm.session).then(function(res) {
              if (!res.ignored) {
                vm.session.sessionData.participantListId = activeList.id;
                addParticipantsFromList(list);
              }
            }, function (error) {
              messenger.error(error);
            });
          } else {
            if (vm.session.sessionData.participantListId == activeList.id) {
              addParticipantsFromList(list);
            } else {
              messenger.error(messagesUtil.sessionBuilder.cantSelect);
            }
          }
          vm.searchingParticipants = false;
        } else {
          messenger.error(messagesUtil.sessionBuilder.noContacts);
        }
      }

      if (vm.searchingObservers) {
        if(list.length > 0) {
          vm.observers = vm.observers.concat(mapToAccountUser(list));
          vm.observers = builderServices.removeDuplicatesFromArray(vm.observers);
          vm.searchingObservers = false;
        }
        else {
          messenger.error(messagesUtil.sessionBuilder.noContacts);
        }
      }
    }

    function isSelectObserverStep() {
      return vm.session.currentStep == "inviteSessionObservers";
    }

    function isSelectParticipantStep() {
      return vm.session.currentStep == "manageSessionParticipants";
    }

    function isSessionClosed() {
      return vm.session.sessionData.showStatus == 'Closed';
    }

    function canInvite() {
      return !isSessionClosed();
    }

    function canSendCloseEmail() {
      return isSelectParticipantStep() && isSessionClosed();
    }

    function canCommentAndRate() {
      return isSelectParticipantStep() && isSessionClosed();
    }
  }

})();
