(function () {
  'use strict';
  angular.module('KliikoApp').factory('sessionBuilderControllerServices', sessionBuilderControllerServices);
  sessionBuilderControllerServices.$inject = ['$q', 'authResource', 'dbg', 'topicsAndSessions'];

  function sessionBuilderControllerServices($q, authResource, dbg, topicsAndSessions) {

    var sessionBuilderApi = authResource('/sessionBuilder/:path', null, {
      canAddObservers: { method: 'GET', params: { path: 'canAddObservers' } },
    });

    var sessionMemberApi = authResource('/sessionMember/:path/:id', null, {
      comment: { method: 'post', params: { id: '@id', path: 'comment' } },
      rate: { method: 'post', params: { id: '@id', path: 'rate' } },
      getMembers: { method: 'post', params: { path: 'members' } },
    });

    var Services = {};

    Services.getTimeSettings = getTimeSettings;
    Services.getExpireDays = getExpireDays;
    Services.findSelectedMembers = findSelectedMembers;
    Services.currentMemberList = currentMemberList;
    Services.selectMembers = selectMembers;
    Services.removeDuplicatesFromArray = removeDuplicatesFromArray;
    Services.canAddObservers = canAddObservers;
    Services.someMembersWereSelected = someMembersWereSelected;
    Services.rateSessionMember = rateSessionMember;
    Services.saveComment = saveComment;
    Services.getSessionMembers = getSessionMembers;

    return Services;

    function getSessionMembers(sessionId, acountUserIds) {
      var deferred = $q.defer();

      dbg.log2('#SessionMember > getSessionMembers > make rest call');
      sessionMemberApi.getMembers({ }, { acountUserIds: acountUserIds, sessionId: sessionId }, function(res) {
        dbg.log2('#SessionMember > getSessionMembers > rest call responds');
        deferred.resolve(res.members);
      });

      return deferred.promise;
    }

    function saveComment(member) {
      var deferred = $q.defer();

      dbg.log2('#SessionMember > saveComment > make rest call');
      sessionMemberApi.comment({ id: member.id }, { comment: member.comment }, function(res) {
        dbg.log2('#SessionMember > saveComment > rest call responds');
        deferred.resolve(res);
      });

      return deferred.promise;
    }

    function rateSessionMember(data) {
      var deferred = $q.defer();

      dbg.log2('#SessionMember > rateSessionMember > make rest call');
      sessionMemberApi.rate(data, function(res) {
        dbg.log2('#SessionMember > rateSessionMember > rest call responds');
        deferred.resolve(res);
      });

      return deferred.promise;
    }

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

    function findSelectedMembers(vm, skipInvited, onlyWithMobile) {
      var array = [];
      var members = currentMemberList(vm);
      for (var i in members) {
        var member = members[i];
        if (member.isSelected && (validStatusForInvitation(member) || !skipInvited) && (!onlyWithMobile || member.mobile) && vm.canSelectMember(member)) {
          array.push(member);
        }
      }

      return array;
    }

    function validStatusForInvitation(member) {
      var validStatuses = ["notInvited", "failed"]
      return validStatuses.indexOf(member.inviteStatus) > -1
    }

    function someMembersWereSelected(vm) {
      var members = currentMemberList(vm);
      for (var i in members) {
        if (members[i].isSelected) {
          return true;
        }
      }
      return false;
    }

    function currentMemberList(vm) {
      return vm.stepMembers;
    }

    function selectMembers(listId, members) {
      var selected = [];
      for (var i in members) {
        var member = members[i];
        if (member._selected && member.canInvite) {
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
