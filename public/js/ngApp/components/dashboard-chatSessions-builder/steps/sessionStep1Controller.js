(function () {
  'use strict';

  angular.module('KliikoApp').controller('SessionStep1Controller', SessionStep1Controller);

  SessionStep1Controller.$inject = ['dbg', 'step1Service', 'sessionBuilderControllerServices', 'messenger', 'SessionModel','$state', '$stateParams', '$filter', 'domServices','$q', '$window', '$rootScope', '$scope'];
  function SessionStep1Controller(dbg, step1Service, builderServices, messenger, SessionModel, $state, $stateParams, $filter, domServices, $q, $window, $rootScope, $scope) {
    dbg.log2('#SessionBuilderController 1 started');

    var vm = this;
    var colorSchemeId, brandLogoId;
    vm.editedContactIndex = null;
    vm.step1 = {};
    vm.$state = $state;

    vm.selectedFacilitator = {};
    vm.userData = {};
    vm.accordions = {};
    vm.facilitators = [];
    vm.logosList = [];
    vm.allContacts = [];
    vm.session = null;

    vm.formAction = null;
    vm.name = '';
    vm.editedContactListName = '';

    vm.updateStep = updateStep;
    vm.initGallery = initGallery;
    vm.galleryDropdownData = galleryDropdownData;
    vm.newFacilitator = newFacilitator;
    vm.openFacilitatorForm = openFacilitatorForm;
    vm.closeFacilitatorForm = closeFacilitatorForm;
    vm.deleteContact = deleteContact;
    vm.editContact = editContact;
    vm.saveEdited = saveEdited;
    vm.inviteFacilitator = inviteFacilitator;

    vm.currentPage = 1;
    vm.pageSize = 3;
    vm.facilitatorContactListId = null;

    function inviteFacilitator(facilitator) {
      vm.session.addMembers(facilitator, 'facilitator').then( function (res) {
        vm.session.steps.step1.facilitator = facilitator;
        messenger.ok("Facilitator was successfully set");
      }, function (err) {
        messenger.error(err);
      });
    }

    function newFacilitator(userData) {
      var params = {
        defaultFields: userData,
        contactListId: vm.facilitatorContactListId
      }

      step1Service.createNewFcilitator(params).then(function (result) {
        result.listName = "Facilitators";
        vm.allContacts.push(result);
        messenger.ok('New contact '+ result.firstName + ' was added to list Facilitators');
        closeFacilitatorForm();
      }, function (error) {
        messenger.error(error);
      })
    }

    function deleteContact(member) {
      step1Service.deleteContact(member.id).then(function () {
        vm.allContacts.splice(vm.allContacts.indexOf(member), 1);
      }, function (error) {
        messenger.error(error);
      })
    }

    function saveEdited(userData) {
      var params = {
        defaultFields: userData,
        contactListId: vm.facilitatorContactListId
      }

      step1Service.updateContact(params).then(function (result) {
        result.data.listName = vm.editedContactListName;
        angular.copy(result.data, vm.allContacts[vm.editedContactIndex])
        vm.userData = {};
        messenger.ok('Contact '+ result.data.firstName + ' has been updated');
        closeFacilitatorForm();
      }, function (error) {
        messenger.error(error);
      })
    }

    function editContact(userData) {
      vm.editedContactListName = userData.listName;
      vm.formAction = 'update';
      domServices.modal('facilitatorForm');
      angular.copy(userData, vm.userData);
      vm.editedContactIndex = vm.allContacts.indexOf(userData);
    }

    function openFacilitatorForm() {
      vm.userData = {};
      vm.formAction = 'new';
      domServices.modal('facilitatorForm');
    }

    function closeFacilitatorForm() {
      domServices.modal('facilitatorForm', 'close');
      vm.userData = {};
    }

    function getAllContacts() {
      step1Service.getAllContacts(sessionId).then(function(results) {
        results.map(function(result) {
          if (result.name == "Facilitators") {
            vm.facilitatorContactListId = result.id;
          }
          result.members.map(function(member) {
            member.listName = result.name;
            vm.allContacts.push(member);
          });
        });
      }, function(error) {
        messenger.error(error);
      })
    }

    vm.initController = function() {
      vm.session = builderServices.session;
      vm.today = new Date();
      vm.today.setDate(vm.today.getDate() - 1);

      vm.dateTime = builderServices.getTimeSettings();
      parseDateAndTime('initial');
      initStep(null, 'initial');
      getAllContacts();
      vm.name = vm.session.steps.step1.name;
      vm.selectedFacilitator = vm.session.steps.step1.facilitator;
    }

    function sessionId() {
      if(vm.session.id) {
        return vm.session.id;
      }else{
        return null;
      }
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
        return updateStep({startTime: vm.session.steps.step1.startTime});
      }

      if (dataObj == 'endTime') {
        parseDateAndTime();
        return updateStep({endTime: vm.session.steps.step1.endTime});
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

    // Gallery stuff
    $scope.$watch(function() {
      return vm.session.sessionData.resourceId;
    }, function(next, prev) {
      if(next != prev) {
        updateStep({ resourceId: next });
      }
    });

    function initGallery(gc) {
      vm.uploadTypes = [gc.getUploadType('brandLogo')];

      gc.listResources({ type: ['image'], scope: ['brandLogo'] }).then(function(result) {
        gc.resourceList = result.resources;
        for(var i in result.resources) {
          var resource = result.resources[i];
          var type = gc.getUploadTypeFromResource(resource);
          gc.selectionList[type].push(resource);
        }
      });
    }

    function galleryDropdownData(dependency) {
      return {
        types: vm.uploadTypes,
        modal: { upload: true, select: true },
        dependency: dependency
      };
    }
  }

})();
