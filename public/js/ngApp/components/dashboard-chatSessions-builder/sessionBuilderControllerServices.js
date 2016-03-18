(function () {
  'use strict';
  angular.module('KliikoApp').factory('sessionBuilderControllerServices', sessionBuilderControllerServices);
  sessionBuilderControllerServices.$inject = ['globalSettings', '$q', '$resource', 'dbg'];

  function sessionBuilderControllerServices(globalSettings, $q, $resource, dbg) {

    var Services = {};


    Services.getTimeSettings = getTimeSettings;
    Services.getDependencies = getDependencies;
    Services.reorderTopics = reorderTopics;
    Services.getExpireDays = getExpireDays;
    Services.findSelectedMembers = findSelectedMembers;
    Services.currentMemberList = currentMemberList;
    Services.currentStepString = currentStepString;
    Services.selectMembers = selectMembers;
    Services.removeDuplicatesFromArray = removeDuplicatesFromArray;

    return Services;

    function getTimeSettings() {
      return {
        hstep:1,
        mstep: 15,

        options: {
          hstep: [1, 2, 3],
          mstep: [1, 5, 10, 15, 25, 30]
        }
      }
    }

    function getDependencies() {
      return {
        step2:  [
            '/js/ngApp/components/dashboard-resources-topics/TopicsController.js',
            '/js/ngApp/modules/topicsAndSessions/topicsAndSessions.js'
        ],
        step3: [
          '/js/ngApp/components/dashboard-resources-emailTemplates/EmailTemplateEditorController.js',
          '/js/vendors/ng-file-upload/ng-file-upload.js'
        ],
        step4: [
          '/js/ngApp/components/dashboard-resources-contactLists/contactListsControllerServices.js',
          '/js/ngApp/components/dashboard-resources-contactLists/ContactListsController.js',
          '/js/ngApp/components/dashboard-resources-contactLists/ListsModel.js',
          '/js/ngApp/components/dashboard-resources-contactLists/ListItemModel.js',
          '/js/ngApp/components/dashboard-resources-contactLists/ListItemMemberModel.js',
          '/js/ngApp/modules/contactList/contactList.js',
          '/js/ngApp/directives/custom-select-directive.js',
          '/js/vendors/ng-file-upload/ng-file-upload.js',
          '/js/ngApp/filters/num.js',
          '/js/ngApp/filters/human2Camel.js'
        ],
        step5: [
          '/js/ngApp/components/dashboard-resources-contactLists/contactListsControllerServices.js',
          '/js/ngApp/components/dashboard-resources-contactLists/ContactListsController.js',
          '/js/ngApp/components/dashboard-resources-contactLists/ListsModel.js',
          '/js/ngApp/components/dashboard-resources-contactLists/ListItemModel.js',
          '/js/ngApp/components/dashboard-resources-contactLists/ListItemMemberModel.js',
          '/js/ngApp/modules/contactList/contactList.js',
          '/js/ngApp/directives/custom-select-directive.js',
          '/js/vendors/ng-file-upload/ng-file-upload.js',
          '/js/ngApp/filters/num.js',
          '/js/ngApp/filters/human2Camel.js'
        ]

      }
    }

    function reorderTopics(vmTopics, data, t) {
      
      var droppedOrderId = data.order || 0;
      var targetOrderId = t.order || 0;
      

      for (var i = 0, len = vmTopics.length; i < len ; i++) {
        if (data.id == vmTopics[i].id) vmTopics[i].order = targetOrderId;
        if (t.id == vmTopics[i].id) vmTopics[i].order = droppedOrderId;
      }

      return vmTopics;

    }

    function getExpireDays(endDate) {
      var today = moment(new Date());
      var expDay = moment(endDate);
      var diff = expDay.diff(today, 'days');

      return (diff <= 5) ? {days:diff} : null;
    }

    function findSelectedMembers(vm) {
      var array = [];
      var members = currentMemberList(vm);
      var stepString = currentStepString(vm);

      for (var i in members) {
        var member = members[i];
        if(member[stepString]) {
          array.push(member);
        }
      }

      return array;
    }

    function currentMemberList(vm) {
      if(vm.currentStep == 4) {
        return vm.participants;
      }
      else if(vm.currentStep == 5) {
        return vm.observers;
      }
    }

    function currentStepString(vm) {
      if(vm.currentStep == 4) {
        return 'step4';
      }
      else if(vm.currentStep == 5) {
        return 'step5';
      }
    }

    function selectMembers(listId, members) {
      var selected = [];
      for(var i in members) {
        var member = members[i];
        if(member._selected) {
          member.listId = listId;
          selected.push(member);
        }
      }
      return selected;
    }

    function removeDuplicatesFromArray(array) {
      var object = {}, newArray = [];
      for (var i = 0; i < array.length; i++) {
        var element = object[array[i].email];
        var check = element && (element.invite || element.sessionMember);

        if(!check) {
          object[array[i].email] = array[i];
        }
      }

      for (var i in object) {
        newArray.push(object[i]);
      }

      return newArray;
    }

  }
  
})();
