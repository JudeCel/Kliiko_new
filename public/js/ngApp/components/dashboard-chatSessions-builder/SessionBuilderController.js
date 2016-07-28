(function () {
  'use strict';

  angular.module('KliikoApp').controller('SessionBuilderController', SessionBuilderController);

  SessionBuilderController.$inject = ['dbg', 'sessionBuilderControllerServices', 'messenger', 'SessionModel','$state', '$stateParams', '$filter', 'domServices',  '$q', '$window', 'ngProgressFactory', '$rootScope', '$scope', 'chatSessionsServices', 'goToChatroom'];
  function SessionBuilderController(dbg, builderServices, messenger, SessionModel, $state, $stateParams, $filter, domServices,  $q, $window, ngProgressFactory,  $rootScope, $scope, chatSessionsServices, goToChatroom) {
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
        $state.go('dashboard.chatSessions.builder', {id: vm.session.id}, {
          location: true, inherit: false, notify: false, reload:false
        });
      }

      vm.participants = vm.session.steps.step4.participants;
      vm.observers = vm.session.steps.step5.observers;
      vm.currentStep = -1;
      initStep().then(function (step) {
        vm.currentStep = step;
      });
    }, function (error) {
      messenger.error(error);
      window.history.back();
    });

    vm.closeSession = closeSession;
    vm.openSession = openSession;
    vm.stepsClassIsActive = stepsClassIsActive;
    vm.updateStep = updateStep;
    vm.goToStep = goToStep;
    vm.goToChat = goToChat;
    vm.canSeeGoToChat = canSeeGoToChat;
    vm.currentPageToDisplay = currentPageToDisplay;
    vm.addFacilitatorsClickHandle = addFacilitatorsClickHandle;

    vm.faderHack = faderHack;

    vm.finishSelectingMembers = finishSelectingMembers;
    vm.selectParticipantsClickHandle = selectParticipantsClickHandle;
    vm.selectObserversClickHandle = selectObserversClickHandle;

    function closeSession() {
      vm.session.setOpen(false).then(function(res) {
      }, function(err) {
        messenger.error(err);
      });
    }

    function openSession() {
      vm.session.setOpen(true).then(function(res) {
      }, function(err) {
        messenger.error(err);
      });
    }

    function goToStep(step) {
      vm.listIgnoring = null;
      if (!angular.isNumber(step)) {
        if (step === 'back')  handlePreviousStep();
        if (step === 'next') handleNextStep();
        if (step === 'finish') {
          $state.go('dashboard.chatSessions');
          messenger.ok('New session is created');
        }
      }

      function handlePreviousStep() {
        vm.cantMoveNextStep = false;
        vm.session.goPreviouseStep().then(function(result) {
          initStep().then(function (step) {
            vm.currentStep = step;
          });
        }, function(error) {
          messenger.error(err)
        }) ;
      }

      function handleNextStep() {
        var routerProgressbar = ngProgressFactory.createInstance();
        routerProgressbar.start();
        vm.session.goNextStep().then(
          function (res) {
            initStep().then(function(step) {
              vm.currentStep = step;
            });
            routerProgressbar.complete();
          },
          function (err) {
            routerProgressbar.complete();
            messenger.error(err)
          }
        );
      }
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

    function canSeeGoToChat(session, accountUser) {
      if(session.sessionData) {
        var facilitator = session.sessionData.facilitator ? session.sessionData.facilitator.accountUserId == accountUser.id : false;
        var member, topics = false;
        if(session.sessionData.SessionMembers) {
          session.sessionData.SessionMembers.map(function(member) {
            if(member.accountUserId == accountUser.id) {
              member = true;
            }
          });
        }

        if(session.steps.step2.topics.length > 0) {
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
        $state.go('dashboard.chatSessions.builder', {id: vm.session.id}, {
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
        vm.session.updateStep(dataObj).then(null, function (err) {
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
        vm.listIgnoring = { includes: true, active: { id: id }, ids: [id] };
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

    function finishSelectingMembers(activeList) {
      if (vm.searchingParticipants) {
        var list = builderServices.selectMembers(activeList.id, activeList.members);

        if(list.length > 0) {
          if(!vm.session.sessionData.participantListId) {
            vm.session.sessionData.participantListId = activeList.id;
            vm.session.updateStep({ participantListId: activeList.id }).then(function(res) {
            }, function (error) {
              messenger.error(error);
            });
          }

          if(vm.session.sessionData.participantListId == activeList.id) {

            vm.participants = vm.participants.concat(list);
            vm.participants = builderServices.removeDuplicatesFromArray(vm.participants);
          }
          else {
            messenger.error("You can't select members from " + activeList.name + ' list');
          }
        }

        vm.searchingParticipants = false;
      }

      if (vm.searchingObservers) {
        vm.observers = vm.observers.concat(builderServices.selectMembers(activeList.id, activeList.members));
        vm.observers = builderServices.removeDuplicatesFromArray(vm.observers);
        vm.searchingObservers = false;
      }
    }
  }

})();
