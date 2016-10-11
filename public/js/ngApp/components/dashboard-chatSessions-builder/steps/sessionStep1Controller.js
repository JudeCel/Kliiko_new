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
    vm.type = null;
    vm.typeToConfirm = '';
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
    vm.cleanColorScheme = cleanColorScheme;
    vm.updateOrCleanColorScheme = updateOrCleanColorScheme;

    vm.currentPage = 1;
    vm.pageSize = 3;
    vm.facilitatorContactListId = null;

    vm.format = 'dd/MM/yyyy';
    vm.dateOption = {
      minDate: Date.now(),
      startingDay: 1,
    }

    function inviteFacilitator(facilitator) {
      vm.session.addMembers(facilitator, 'facilitator').then(function(res) {
        vm.session.sessionData.facilitator = facilitator;
        vm.session.steps.step1.facilitator = facilitator;
        messenger.ok(res.message);
      }, function (err) {
        messenger.error(err);
      });
    }

    function cleanColorScheme(executeUpdate) {
      vm.colorScheme = null;
      executeUpdate({ brandProjectPreferenceId: null });
    }

    function updateOrCleanColorScheme(id, executeUpdate) {
      if (vm.session.steps.step1.brandProjectPreferenceId == id) {
        vm.colorScheme = null;
        vm.session.steps.step1.brandProjectPreferenceId = null;
        executeUpdate({ brandProjectPreferenceId: null });
      } else {
        executeUpdate({ brandProjectPreferenceId: id });
        vm.session.steps.step1.brandProjectPreferenceId = id;
      }
    }

    function newFacilitator(userData) {
      var params = {
        defaultFields: userData,
        contactListId: vm.facilitatorContactListId
      }

      step1Service.createNewFcilitator(params).then(function(result) {
        result.user.listName = "Facilitators";
        vm.allContacts.push(result.user);
        messenger.ok(result.facMessage);
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

      step1Service.updateContact(params).then(function(res) {
        res.data.listName = vm.editedContactListName;
        angular.copy(res.data, vm.allContacts[vm.editedContactIndex])
        vm.userData = {};
        messenger.ok(res.message);
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
      vm.step1.startTime = vm.session.steps.step1.startTime;
      vm.step1.endTime = vm.session.steps.step1.endTime;
      vm.step1.timeZone = vm.session.steps.step1.timeZone;
      vm.step1.ngModalOptions = { timezone: vm.session.steps.step1.timeZoneOffset };
      initStep(null, 'initial');
      getAllContacts();
      vm.name = vm.session.steps.step1.name;
      vm.type = vm.session.steps.step1.type;
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

    vm.confirmType = function () {
      vm.typeToConfirm = vm.type;
      vm.type = vm.session.steps.step1.type;
      if (vm.session.steps.step1.type == null) {
        domServices.modal('sessionTypeModal');
      }
    }

    vm.updateType = function () {
      domServices.modal('sessionTypeModal', 'close');
      vm.type = vm.typeToConfirm;
      updateStep({type: vm.type}).then(function() {
        vm.session.steps.step1.type = vm.type;
      }, function(err) {
        vm.type = vm.session.steps.step1.type;
      });
    }

    function validateDate(date) {
      if(date) {
        if(vm.step1.endTime < vm.step1.startTime) {
          vm.accordions.dateAndTimeError = true;
        }
        else {
          vm.accordions.dateAndTimeError = false;
          vm.accordions.invalidFormat = false;
          return true;
        }
      }
      else {
        vm.accordions.dateAndTimeError = false;
        vm.accordions.invalidFormat = true;
      }

      return false;
    }

    function updateStep(dataObj) {
      if (dataObj == 'startTime' || dataObj == 'endTime' || dataObj == 'timeZone') {
        if(validateDate(vm.step1.startTime) && validateDate(vm.step1.endTime)) {
          updateStep({ startTime: vm.step1.startTime, endTime: vm.step1.endTime, timeZone: vm.step1.timeZone });
        }
        return;
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

      gc.listResources({ type: ['image'], scope: ['brandLogo'], stock: true }).then(function(result) {
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
