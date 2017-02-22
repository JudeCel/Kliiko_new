(function () {
  'use strict';

  angular.module('KliikoApp').controller('SessionStep1Controller', SessionStep1Controller);

  SessionStep1Controller.$inject = ['dbg', 'step1Service', 'sessionBuilderControllerServices', 'messenger', 'SessionModel','$state', '$stateParams', '$filter', 'domServices','$q', '$window', '$rootScope', '$scope', '$confirm', '$sce', 'propertyDisabler'];
  function SessionStep1Controller(dbg, step1Service, builderServices, messenger, SessionModel, $state, $stateParams, $filter, domServices, $q, $window, $rootScope, $scope, $confirm, $sce, propertyDisabler) {
    dbg.log2('#SessionBuilderController 1 started');

    var vm = this;
    var colorSchemeId, brandLogoId;
    vm.editedContactIndex = null;
    vm.step1 = {};
    vm.q = "";
    vm.$state = $state;

    vm.selectedFacilitator = {};
    vm.userData = {};
    vm.accordions = {};
    vm.facilitators = [];
    vm.logosList = [];
    vm.allContacts = [];
    vm.session = null;
    vm.selectedFacilitatorEmail = null;
    vm.canSelectFacilitator = false;

    vm.formAction = null;
    vm.name = '';
    vm.type = null;
    vm.typeToConfirm = '';
    vm.anonymous = '';
    vm.anonymousToConfirm = '';
    vm.editedContactListName = '';

    vm.updateStep = updateStep;
    vm.initGallery = initGallery;
    vm.galleryDropdownData = galleryDropdownData;
    vm.newFacilitator = newFacilitator;
    vm.openFacilitatorForm = openFacilitatorForm;
    vm.closeFacilitatorForm = closeFacilitatorForm;
    vm.deleteContact = deleteContact;
    vm.filterContacts = filterContacts;
    vm.editContact = editContact;
    vm.saveEdited = saveEdited;
    vm.inviteFacilitator = inviteFacilitator;
    vm.cleanColorScheme = cleanColorScheme;
    vm.updateOrCleanColorScheme = updateOrCleanColorScheme;
    vm.showTimeBlockedMessage = showTimeBlockedMessage;

    vm.currentPage = 1;
    vm.pageSize = 3;
    vm.facilitatorContactListId = null;

    vm.format = 'dd/MM/yyyy';
    vm.dateOption = {
      minDate: Date.now(),
      startingDay: 1,
    }

    function initCanSelectFacilitator() {
      vm.canSelectFacilitator = vm.session.steps.step1.name && vm.session.steps.step1.name.length > 0
        && vm.type != null && new Date(vm.step1.endTime) > new Date(vm.step1.startTime);
    }

    function inviteFacilitator(facilitator) {
      if (!vm.selectedFacilitator || facilitator.email != vm.selectedFacilitator.email) {
        vm.selectedFacilitatorEmail = vm.selectedFacilitator ? vm.selectedFacilitator.email : null;
        var text = vm.selectedFacilitator ?
          "<p>- If you have already sent Session Invitations, and started a Session, this may affect a Guest's level of engagement!</p>"
            + "<p>- The Name & Contact details on the Email Templates signature will change to the new Host on any future emails.</p>"
            + "<p>- As will the Host-Avatar Name in the Chat Room.</p>"
            + "<p>- If unavoidable, we strongly recommend sending an SMS, Generic Email or Chat Room Private Message to Guests explaining the change.</p>" :
          "Are you sure you want to select this Host - <b>"
            + facilitator.firstName + " " + facilitator.lastName
            + "</b>?<br/> We strongly suggest that any change to the Host later, may confuse Guests!";
        var leftAndWide = vm.selectedFacilitator ? true : false;
        $confirm({ text: text, htmlText: $sce.trustAsHtml(text), textLeft: leftAndWide, wide: leftAndWide }).then(function() {
          vm.session.addMembers(facilitator, 'facilitator').then(function(res) {
            if (!res.ignored) {
              vm.session.sessionData.facilitator = facilitator;
              vm.session.steps.step1.facilitator = facilitator;
              messenger.ok(res.message);
            }
            vm.selectedFacilitator = vm.session.steps.step1.facilitator;
            vm.selectedFacilitatorEmail = vm.selectedFacilitator.email;
          }, function (err) {
            messenger.error(err);
          });
        });
      }
    }

    function cleanColorScheme(executeUpdate) {
      vm.colorScheme = null;
      executeUpdate({ brandProjectPreferenceId: null });
    }

    function updateOrCleanColorScheme(id, executeUpdate) {
      propertyDisabler.disablePropertyChanges('colorScheme');
      if (vm.session.steps.step1.brandProjectPreferenceId == id) {
        vm.colorScheme = null;
        vm.session.steps.step1.brandProjectPreferenceId = null;
      } else {
        vm.session.steps.step1.brandProjectPreferenceId = id;
      }
      vm.session.updateStep({ brandProjectPreferenceId: vm.session.steps.step1.brandProjectPreferenceId }, vm.session).then(function() {
        propertyDisabler.enablePropertyChanges('colorScheme');
      }, function() {
        propertyDisabler.enablePropertyChanges('colorScheme');
        messenger.error(err);
      });
    }

    function newFacilitator(userData) {
      var params = {
        defaultFields: userData,
        contactListId: vm.facilitatorContactListId
      }

      step1Service.createNewFcilitator(params).then(function(result) {
        result.user.listName = "Hosts";
        result.user.role = 'facilitator';
        result.user.id = result.user.accountUserId;
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
        res.data.role = vm.allContacts[vm.editedContactIndex].role;
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

    function showTimeBlockedMessage() {
      if (vm.session.steps.step1.canEditTime == false) {
        $confirm({ text: vm.session.steps.step1.canEditTimeMessage, title: 'Sorry', closeOnly: true, showAsError: true });
      }
    }

    function filterContacts() {
      if(vm.q) {
        return vm.q;
      }
      else {
        var facilitator = vm.session.steps.step1.facilitator;
        return function(item) {
          return ['facilitator', 'accountManager'].indexOf(item.role) > -1 || facilitator && facilitator.email === item.email;
        };
      }
    }

    function getAllContacts() {
      step1Service.getAllContacts(sessionId).then(function(results) {
        results.map(function(result) {
          if (result.name == "Hosts") {
            vm.facilitatorContactListId = result.id;
          }
          result.members.map(function(member) {
            member.id = member.accountUserId;
            member.role = result.role;
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
      vm.step1.ngModalOptions = { timezone: 'UTC' };
      initStep(null, 'initial');
      getAllContacts();
      vm.name = vm.session.steps.step1.name;
      vm.type = vm.session.steps.step1.type;
      vm.anonymous = vm.session.steps.step1.anonymous.toString();
      vm.selectedFacilitator = vm.session.steps.step1.facilitator;
      vm.selectedFacilitatorEmail = vm.selectedFacilitator ? vm.selectedFacilitator.email : null;
      initCanSelectFacilitator();
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
      updateStep({name: vm.name}).then(function(res) {
        if (res.ignored) {
          vm.name = vm.session.steps.step1.name;
        } else {
          vm.session.steps.step1.name = vm.name;
        }
        initCanSelectFacilitator();
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
      updateStep({type: vm.type}).then(function(res) {
        if (res.ignored) {
          vm.type = vm.session.steps.step1.type;
        } else {
          vm.session.steps.step1.type = vm.type;
        }
        initCanSelectFacilitator();
      }, function(err) {
        vm.type = vm.session.steps.step1.type;
      });
    }

    vm.confirmAnonymous = function () {
      vm.anonymousToConfirm = vm.anonymous;
      vm.anonymous = vm.session.steps.step1.anonymous.toString();
      if (!vm.session.steps.step1.anonymous) {
        domServices.modal('sessionAnonymousModal');
      }
    }

    vm.updateAnonymous = function () {
      domServices.modal('sessionAnonymousModal', 'close');
      vm.anonymous = vm.anonymousToConfirm;
      vm.session.setAnonymous().then(function(res) {
        vm.session.steps.step1.anonymous = res.anonymous;
      }, function(err) {
        vm.anonymous = vm.session.steps.step1.anonymous;
      });
    }

    function validateDate(date) {
      if (date) {
        if(vm.step1.endTime <= vm.step1.startTime) {
          vm.accordions.dateAndTimeError = true;
        } else {
          vm.accordions.dateAndTimeError = false;
          vm.accordions.invalidFormat = false;
          return true;
        }
      } else {
        vm.accordions.dateAndTimeError = false;
        vm.accordions.invalidFormat = true;
      }

      return false;
    }

    function postUpdateStep(dataObj) {
      var deferred = $q.defer();
      vm.session.updateStep(dataObj, vm.session).then(function(res) {
        deferred.resolve(res);
      }, function (err) {
        messenger.error(err);
        deferred.reject(err);
      });

      return deferred.promise;
    }

    function updateStep(dataObj) {
      if (dataObj == 'startTime' || dataObj == 'endTime' || dataObj == 'timeZone') {
        if (propertyDisabler.isPropertyDisabled('dateAndTime')) {
          setTimeout(function() {
            updateStep(dataObj);
          }, 10);
          return;
        }
        propertyDisabler.disablePropertyChanges('dateAndTime');
        initCanSelectFacilitator();
        if(validateDate(vm.step1.startTime) && validateDate(vm.step1.endTime)) {
          postUpdateStep({ startTime: vm.step1.startTime, endTime: vm.step1.endTime, timeZone: vm.step1.timeZone }).then(function(res) {
            if (res.ignored) {
              vm.step1.startTime = vm.session.steps.step1.startTime;
              vm.step1.endTime = vm.session.steps.step1.endTime;
              vm.step1.timeZone = vm.session.steps.step1.timeZone;
            }
            propertyDisabler.enablePropertyChanges('dateAndTime');
          }, function(error) {
            propertyDisabler.enablePropertyChanges('dateAndTime');
          });
        } else {
          propertyDisabler.enablePropertyChanges('dateAndTime');
        }
        return;
      } else {
        return postUpdateStep(dataObj);
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
      gc.preloadResources({ type: ['image'], scope: ['brandLogo'], stock: true });
    }

    function galleryDropdownData(dependency, validation) {
      return {
        validation: validation || 'brandLogoAndCustomColors',
        types: vm.uploadTypes,
        modal: { upload: true, select: true },
        dependency: dependency
      };
    }
  }

})();
