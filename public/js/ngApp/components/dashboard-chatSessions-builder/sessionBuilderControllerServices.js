(function () {
  'use strict';
  angular.module('KliikoApp').factory('sessionBuilderControllerServices', sessionBuilderControllerServices);
  sessionBuilderControllerServices.$inject = ['globalSettings', '$q', '$resource', 'dbg', 'topicsAndSessions'];

  function sessionBuilderControllerServices(globalSettings, $q, $resource, dbg, topicsAndSessions) {

    var sessionBuilderApi = $resource(globalSettings.restUrl + '/sessionBuilder/:path', null, {
      canAddObservers: { method: 'GET', params: { path: 'canAddObservers' } },
    });

    var Services = {};

    Services.getTimeSettings = getTimeSettings;
    Services.getExpireDays = getExpireDays;
    Services.findSelectedMembers = findSelectedMembers;
    Services.currentMemberList = currentMemberList;
    Services.selectMembers = selectMembers;
    Services.removeDuplicatesFromArray = removeDuplicatesFromArray;
    Services.canAddObservers = canAddObservers;

    return Services;

    function canAddObservers() {
      var deferred = $q.defer();

      dbg.log2('#brandColourServices > canAddObservers > make rest call');
      sessionBuilderApi.canAddObservers({}, function(res) {
        dbg.log2('#brandColourServices > canAddObservers > rest call responds');

        deferred.resolve(res);
      });

      return deferred.promise;
    }

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

    function getExpireDays(endDate) {
      var today = moment(new Date());
      var expDay = moment(endDate);
      var diff = expDay.diff(today, 'days');

      if(diff <= 5 && diff > 0) {
        return "Session will expire in " + diff + " day(s)";
      }else if(diff == 0){
        return "Session will expire today";
      }

      return null;
    }

    function findSelectedMembers(vm) {
      var array = [];
      var members = currentMemberList(vm);

      for (var i in members) {
        var member = members[i];
        if(member.isSelected) {
          array.push(member);
        }
      }

      return array;
    }

    function currentMemberList(vm) {
        return vm.stepMembers;
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
