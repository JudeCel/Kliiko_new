(function () {
  'use strict';

  angular.module('KliikoApp').controller('SessionStep1Controller', SessionStep1Controller);

  SessionStep1Controller.$inject = ['dbg', 'sessionBuilderControllerServices', 'messenger', 'SessionModel','$state', '$stateParams', '$filter', 'domServices', '$ocLazyLoad', '$q', '$window', 'ngProgressFactory', '$rootScope', '$scope'];
  function SessionStep1Controller(dbg, builderServices, messenger, SessionModel, $state, $stateParams, $filter, domServices, $ocLazyLoad, $q, $window, ngProgressFactory,  $rootScope, $scope) {
    dbg.log2('#SessionBuilderController 1 started');

    var vm = this;
    var colorSchemeId, brandLogoId;
    vm.step1 = {};

    vm.accordions = {};
    vm.facilitators = [];
    vm.logosList = [];
    vm.session = null;

    vm.updateStep = updateStep;
    vm.addFacilitatorsClickHandle = addFacilitatorsClickHandle;
    vm.facilitatorsSelectHandle = facilitatorsSelectHandle;

    vm.initController = function() {
      vm.session = builderServices.session;
      vm.today = new Date();
      vm.dateTime = builderServices.getTimeSettings();
      parseDateAndTime('initial');
      initStep(null, 'initial');
    }

    $scope.$on('$destroy', function() {
      if (vm.wFacilitators) {
        vm.wFacilitators();
      };
      if (vm.wLogosList) {
        vm.wLogosList();
      };
      if (vm.wColorsList) {
        vm.wColorsList();
      };
    });

    function initStep(step, initial) {
      // populate facilitator
      vm.wFacilitators = $scope.$watch('step1Controller.facilitators', function (newval, oldval) {
        if (!vm.facilitators) {
          return;
        }
        for (var i = 0, len = vm.facilitators.length; i < len ; i++) {
          if (vm.facilitators[i].accountUserId == vm.session.steps.step1.facilitator) {
            vm.selectedFacilitator = vm.facilitators[i];
            break;
          }
        }
        vm.name = vm.session.steps.step1.name;
      }, true);

      // populate logo
      if (vm.session.steps.step1.resourceId) {
        vm.wLogosList = $scope.$watch('step1Controller.logosList', function (newval, oldval) {
          if (vm.logosList) {
            for (var i = 0, len = vm.logosList.length; i < len ; i++) {
              if (vm.logosList[i].id == vm.session.steps.step1.resourceId) {
                vm.brandLogo = vm.logosList[i];
                break;
              }
            }
          }
        }, true);
      }

      // populate color scheme
      if (vm.session.steps.step1.brandProjectPreferenceId) {
        vm.wColorsList = $scope.$watch('step1Controller.colorsList', function (newval, oldval) {
          if (vm.colorsList) {
            for (var i = 0, len = vm.colorsList.length; i < len ; i++) {
              if (vm.colorsList[i].id == vm.session.steps.step1.brandProjectPreferenceId) {
                vm.colorScheme = vm.colorsList[i];
                break;
              }
            }
          }
        }, true);
      }
    }

    vm.updateName = function() {
      updateStep({name: vm.name}).then(function() {
        vm.session.steps.step1.name = vm.name;
      }, function(err) {
        vm.name = vm.session.steps.step1.name;
      });
    }

    function updateStep(dataObj) {
      if (dataObj == 'startTime') {
        parseDateAndTime();
        return updateStep({start_time: vm.session.steps.step1.startTime});
      }

      if (dataObj == 'endTime') {
        parseDateAndTime();
        return updateStep({end_time: vm.session.steps.step1.endTime});
      }

      var deferred = $q.defer();

      vm.session.updateStep(dataObj).then(function() {
        deferred.resolve();
      }, function (err) {
        messenger.error(err);
        deferred.reject(err);
      });

      return deferred.promise;
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

    function addFacilitatorsClickHandle() {
      vm.showContactsList = true;
    }

    function facilitatorsSelectHandle(facilitator) {
      vm.session.steps.step2.facilitator = facilitator;
      vm.showContactsList = false;
      vm.session.addMembers(facilitator, 'facilitator').then( function (res) {
          messenger.ok("Facilitator was successfully set");
        },
        function (err) { messenger.error(err);  }
      );
    }
  }

})();
