(function () {
  'use strict';

  angular.module('KliikoApp').controller('SessionBuilderController', SessionBuilderController);

  SessionBuilderController.$inject = ['dbg', 'sessionBuilderControllerServices', 'messenger', 'SessionModel','$state', '$stateParams', '$filter', 'domServices', '$ocLazyLoad', '$q', '$window', 'ngProgressFactory', '$rootScope', '$scope'];
  function SessionBuilderController(dbg, builderServices, messenger, SessionModel, $state, $stateParams, $filter, domServices, $ocLazyLoad, $q, $window, ngProgressFactory,  $rootScope, $scope) {
    dbg.log2('#SessionBuilderController started');

    var vm = this;
    var intervals = {};
    var sessionId = $stateParams.id || null;
    vm.basePath = '/js/ngApp/components/dashboard-chatSessions-builder/';
    vm.$state = $state;

    vm.session = new SessionModel(sessionId);
    builderServices.session = vm.session;

    vm.session.init().then(function(res) {

    //add session id for newly build one
      if (!$stateParams.id) {
        $state.go('dashboard.chatSessions.builder', {id: vm.session.id}, {
          location: true, inherit: false, notify: false, reload:false
        });
      }

      vm.participants = vm.session.steps.step4.participants;
      vm.observers = [];
      initStep(null, 'initial');
    });

    vm.currentStep = -1;
    vm.closeSession = closeSession;
    vm.openSession = openSession;
    vm.stepsClassIsActive = stepsClassIsActive;
    vm.updateStep = updateStep;
    vm.goToStep = goToStep;
    vm.goToChat = goToChat;
    vm.currentPageToDisplay = currentPageToDisplay;
    vm.addFacilitatorsClickHandle = addFacilitatorsClickHandle;
    vm.facilitatorsSelectHandle = facilitatorsSelectHandle;

    vm.faderHack = faderHack;

    vm.finishSelectingMembers = finishSelectingMembers;
    vm.selectParticipantsClickHandle = selectParticipantsClickHandle;
    vm.selectObserversClickHandle = selectObserversClickHandle;
    function closeSession() {
      vm.session.close();
    }

    function openSession() {
      vm.session.open();
    }

    function goToStep(step) {
      if (!angular.isNumber(step)) {
        if (step === 'back')  handlePreviousStep();
        if (step === 'next') handleNextStep();
        if (step === 'finish') {
          vm.session.update();
          $state.go('dashboard.chatSessions');
          messenger.ok('New session is created');
        }
      }


      function handlePreviousStep() {
        vm.cantMoveNextStep = false;
        vm.session.goPreviouseStep().then(function(result) {
          initStep().then(function (res) {});
        }, function(error) {
          messenger.error(err)
        }) ;
      }

      function handleNextStep() {
        var routerProgressbar = ngProgressFactory.createInstance();
        routerProgressbar.start();

        vm.session.updateStep().then(
          function(res) {
            vm.searchingParticipants = false;
            vm.searchingObservers = false;

            vm.session.goNextStep().then(
              function (res) {
                initStep().then(function(res) {});
                routerProgressbar.complete();
              },
              function (err) {
                routerProgressbar.complete();
                messenger.error(err)
              }
            );

          },
          function (err) {
            routerProgressbar.complete();
            if (err) messenger.error(err);
          }
        );
      }
    }

    function goToChat(session) {
      if (session.showStatus && session.showStatus == 'Expired') return;
      $window.location.href = session.chatRoomUrl + session.id;
    }


    function initStep() {

      console.log("____reinit", vm.currentStep);
      var deferred = $q.defer();

      if (!$stateParams.id) {
        $state.go('dashboard.chatSessions.builder', {id: vm.session.id}, {
          location: true, inherit: false, notify: false, reload:false
        });
      }

      vm.lastStep = null;
      showExpiresWarning();

      if (vm.session.sessionData.step == "facilitatiorAndTopics") {
        $ocLazyLoad.load( builderServices.getDependencies().step2 ).then(function(res) {
          vm.currentStep = 2;
          deferred.resolve();
        },
        function(err) {
          messenger.error(err);
          deferred.reject(err);
        });
      }
      else if (vm.session.sessionData.step == "manageSessionEmails") {
        $ocLazyLoad.load( builderServices.getDependencies().step3 ).then(function(res) {
          vm.currentStep = 3;
          deferred.resolve();
        },
          function(err) {
            messenger.error(err);
            deferred.reject(err);
          });
      }
      else if (vm.session.sessionData.step == "manageSessionParticipants") {
        $ocLazyLoad.load( builderServices.getDependencies().step4 ).then(function(res) {
          vm.currentStep = 4;
          deferred.resolve();
        },
          function(err) {
            messenger.error(err);
            deferred.reject(err);
          });
      }
      else if (vm.session.sessionData.step == "inviteSessionObservers") {
        $ocLazyLoad.load( builderServices.getDependencies().step5 ).then(function(res) {
          vm.lastStep = true;
          vm.currentStep = 5;
          deferred.resolve();
        },
          function(err) {
            messenger.error(err);
            deferred.reject(err);
          });
      } else {
        vm.currentStep = 1;
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
        vm.session.updateStep(dataObj).then(
        function (res) {
        },
        function (err) {
          messenger.error(err);
        }
      );
    }

    function currentPageToDisplay() {
      if ( vm.showContactsList || vm.searchingParticipants || vm.searchingObservers ) {
        return vm.basePath+'steps/contactLists.html';
      }

      if (vm.currentStep == 1) {
        return vm.basePath+'steps/step1.tpl.html';
      } else if (vm.currentStep == 2) {
        return vm.basePath+'steps/step2.tpl.html';
      }
      else if (vm.currentStep == 3) {
        return vm.basePath+'steps/step3.tpl.html';
      }
      else if (vm.currentStep == 4 || vm.currentStep == 5) {
        return vm.basePath+'steps/step4-5.tpl.html';
      }
      else
        return "";
    }

    function addFacilitatorsClickHandle() {
      vm.showContactsList = true;
    }

    function facilitatorsSelectHandle(facilitator) {
      vm.session.steps.step2.facilitator = facilitator;
      vm.session.addMembers(facilitator, 'facilitator').then(
        function (res) {  vm.session.update();  },
        function (err) { messenger.error(err);  }
      );
    }

    function faderHack() {
      setTimeout(function() {
        jQuery('.modal-backdrop.fade.in').hide();
      }, 10);
    }

    function selectParticipantsClickHandle() {
      vm.searchingParticipants = true;
    }

    function selectObserversClickHandle() {
      vm.searchingObservers = true;
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

      console.log("______activeList", vm.participants);
    }
  }

})();
