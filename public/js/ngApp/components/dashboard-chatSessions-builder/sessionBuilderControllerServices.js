(function () {
  'use strict';
  angular.module('KliikoApp').factory('sessionBuilderControllerServices', sessionBuilderControllerServices);
  sessionBuilderControllerServices.$inject = ['globalSettings', '$q', '$resource', 'dbg', 'topicsAndSessions'];

  function sessionBuilderControllerServices(globalSettings, $q, $resource, dbg, topicsAndSessions) {

    var Services = {};


    Services.getTimeSettings = getTimeSettings;
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

      for (var i in members) {
        var member = members[i];
        if(member[stepString]) {
          array.push(member);
        }
      }

      return array;
    }

    function currentMemberList(vm) {
        return vm.participants;
    }

    function currentStepString(vm) {
        return 'step4';
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

    function parseTopics(topicsArray) {
      topicsArray.sort(function(a, b){return b.SessionTopics[0].order-a.SessionTopics[0].order});
      for (var i = 0, len = topicsArray.length; i < len ; i++) {
        topicsArray[i].order = topicsArray[i].SessionTopics[0].order;
      }
      return topicsArray;
    }

  }

})();
