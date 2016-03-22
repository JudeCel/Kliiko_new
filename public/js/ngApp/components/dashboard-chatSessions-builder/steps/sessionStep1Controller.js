(function () {
  'use strict';

  angular.module('KliikoApp').controller('SessionStep1Controller', SessionStep1Controller);

  SessionStep1Controller.$inject = ['dbg', 'sessionBuilderControllerServices', 'messenger', 'SessionModel','$state', '$stateParams', '$filter', 'domServices', '$ocLazyLoad', '$q', '$window', 'ngProgressFactory', '$rootScope', '$scope'];
  function SessionStep1Controller(dbg, builderServices, messenger, SessionModel, $state, $stateParams, $filter, domServices, $ocLazyLoad, $q, $window, ngProgressFactory,  $rootScope, $scope) {
    dbg.log2('#SessionBuilderController 1 started');

    var vm = this;

    var colorSchemeId, brandLogoId;
    var intervals = {};

    vm.step1 = {};

    vm.accordions = {};
    vm.$state = $state;
    vm.facilitators = [];

    vm.session = null;

    vm.closeSession = closeSession;
    vm.openSession = openSession;
    vm.updateStep = updateStep;
    vm.goToStep = goToStep;
    vm.goToChat = goToChat;
    vm.addFacilitatorsClickHandle = addFacilitatorsClickHandle;
    vm.facilitatorsSelectHandle = facilitatorsSelectHandle;
    vm.parentController;

    vm.watchers = [];
    vm.initController = function() {
      vm.session = builderServices.session; //parentController.session;
      vm.today = new Date();
      vm.dateTime = builderServices.getTimeSettings();
      parseDateAndTime('initial');
      initStep(null, 'initial');
    }

    $scope.$on('$destroy', function() {
      for (var i; i < vm.watchers.length; i++) {
        vm.watchers[i]();
      }
      vm.watchers.length = 0;
    });

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
        vm.cantMoveNextStep = false;  step = vm.currentStep - 1;
        vm.session.goPreviouseStep();
        initStep(step).then(function (res) {
          vm.currentStep = step;
        });


      }

      function handleNextStep() {
        var routerProgressbar = ngProgressFactory.createInstance();
        routerProgressbar.start();

        step = vm.currentStep;

        vm.session.updateStep().then(
          function(res) {
            vm.searchingParticipants = false;
            vm.searchingObservers = false;

            vm.session.goNextStep().then(
              function (res) {
                initStep(step+1).then(function(res) {
                  $stateParams.ssessionBuilderStep = vm.currentStep = step+1;
                });

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

    function initStep(step, initial) {
        // populate facilitator
        vm.watchers.push($scope.$watch('step1Controller.facilitators', function (newval, oldval) {
          if (!vm.facilitators) {
            return;
          }
          for (var i = 0, len = vm.facilitators.length; i < len ; i++) {
            if (vm.facilitators[i].accountUserId == vm.session.steps.step2.facilitator) {
              vm.selectedFacilitator = vm.facilitators[i];
              break;
            }
          }
        }, true));

        // populate logo
        if (vm.session.steps.step1.resourceId) {
          vm.watchers.push($scope.$watch('step1Controller.logosList', function (newval, oldval) {
            if (vm.logosList) {
              for (var i = 0, len = vm.logosList.length; i < len ; i++) {
                if (vm.logosList[i].id == vm.session.steps.step1.resourceId) {
                  vm.brandLogo = vm.logosList[i];
                  break;
                }
              }
            }
          }, true));
        }

        // populate color scheme
        if (vm.session.steps.step1.brandProjectPreferenceId) {

          if (vm.session.steps.step1.resourceId) {
            vm.watchers.push($scope.$watch('step1Controller.logosList', function (newval, oldval) {
              if (vm.colorsList) {
                for (var i = 0, len = vm.colorsList.length; i < len ; i++) {
                  if (vm.colorsList[i].id == vm.session.steps.step1.brandProjectPreferenceId) {
                    vm.colorScheme = vm.colorsList[i];
                    break;
                  }
                }
              }
            }, true));
          }
        }
    }

    function updateStep(dataObj) {
      if (dataObj == 'startTime') {
        parseDateAndTime();
        updateStep({startTime: vm.session.steps.step1.startTime});
        return;
      }

      if (dataObj == 'endTime') {
        parseDateAndTime();
        updateStep({endTime: vm.session.steps.step1.endTime});
        return;
      }

        vm.session.updateStep(dataObj).then(
        function (res) {
        },
        function (err) {
          messenger.error(err);
        }
      );

    }


    /**
     * convert date and time inputs to timestamp in session object -> steps -> step1 for start and rnd dates
     */
    function parseDateAndTime(initial) {
      var startDate, startHours, startMinutes, endDate, endHours, endMinutes;

      if (!vm.session.steps) return;
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

        (new Date(startDate).getTime() > new Date(endDate).getTime() )
          ?  vm.accordions.dateAndTimeError = true
          :  vm.accordions.dateAndTimeError = false;

      }


    }


    /// step 2

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


  }

})();
