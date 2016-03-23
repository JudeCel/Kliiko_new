(function () {
  'use strict';
  angular.module('KliikoApp').factory('sessionBuilderControllerServices', sessionBuilderControllerServices);
  sessionBuilderControllerServices.$inject = ['globalSettings', '$q', '$resource', 'dbg', 'topicsAndSessions'];

  function sessionBuilderControllerServices(globalSettings, $q, $resource, dbg, topicsAndSessions) {

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
    Services.parseTopics = parseTopics;

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
        if (data.id == vmTopics[i].id) {
          vmTopics[i].order = targetOrderId;
          topicsAndSessions.updateTopic(vmTopics[i]);
        }

        if (t.id == vmTopics[i].id) {
          vmTopics[i].order = droppedOrderId;
          topicsAndSessions.updateTopic(vmTopics[i]);
        }
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

      console.log("______~~~~~~", members, "~~~~~~~~~~~~",stepString);


      for (var i in members) {
        var member = members[i];
        if(member[stepString]) {
          array.push(member);
        }
      }

      return array;
    }

    function currentMemberList(vm) {
      if (vm.session.sessionData.step == "manageSessionParticipants") {
        return vm.participants;
      }
      else if (vm.session.sessionData.step == 'inviteSessionObservers') {
        return vm.observers;
      }
    }

    function currentStepString(vm) {

      if (vm.session.sessionData.step == "manageSessionParticipants") {
        return 'step4';
      }
      else// if (vm.session.sessionData.step == 'inviteSessionObservers') {
        return 'step5';
    //  }
    }

    function selectMembers(listId, members) {
      var selected = [];
      for(var i in members) {
        console.log('selected id', listId);
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

    function parseTopics(topicsArray) {
      for (var i = 0, len = topicsArray.length; i < len ; i++) {
        topicsArray[i].order = topicsArray[i].SessionTopics[0].order || i;
      }

      return topicsArray;
    }

  }

})();
