(function () {
  'use strict';

  angular.module('KliikoApp').controller('ChatSessionsController', ChatSessionsController);
  ChatSessionsController.$inject = ['dbg', 'chatSessionsServices', 'messenger', 'angularConfirm', '$window'];

  function ChatSessionsController(dbg, chatSessionsServices, messenger, angularConfirm, $window){
    dbg.log2('#ChatSessionsController started');

    var vm = this;
    vm.removeSession = removeSession;
    vm.copySession = copySession;

    vm.rowClass = rowClass;
    vm.showStatus = showStatus;
    vm.subscriptionEndDate = subscriptionEndDate;
    vm.goToChat = goToChat;
    vm.hasAccess = hasAccess;
    vm.isExpired = isExpired;

    initList();

    function initList() {
      chatSessionsServices.findAllSessions().then(function(res) {
        vm.sessions = res.data;
        vm.dateFormat = res.dateFormat;
        vm.chatRoomUrl = res.chatRoomUrl;
        vm.sessionListManageRoles = res.sessionListManageRoles;
        dbg.log2('#ChatSessionsController > getChatSessions > res ', res.data);
      });
    };

    function removeSession(session) {
      angularConfirm('Are you sure you want to remove Session?').then(function(response) {
        chatSessionsServices.removeSession({ id: session.id }).then(function(res) {
          if(res.error) {
            messenger.error(chatSessionsServices.prepareError(res.error));
          }
          else {
            messenger.ok(res.message);
            var index = vm.sessions.indexOf(session);
            vm.sessions.splice(index, 1);
          }
        });
      });
    };

    function copySession(session) {
      chatSessionsServices.copySession({ id: session.id }).then(function(res) {
        if(res.error) {
          messenger.error(chatSessionsServices.prepareError(res.error));
        }
        else {
          messenger.ok(res.message);
          vm.sessions.push(res.data);
        }
      });
    };

    function rowClass(session, user) {
      var string = showStatus(session, user).toLowerCase();
      return 'session-' + string;
    };

    function goToChat(session, user) {
      if(!isExpired(user)) {
        $window.location.href = vm.chatRoomUrl + session.id;
      }
    };

    function subscriptionEndDate(user) {
      if(user && user.subscriptions) {
        return new Date(user.subscriptions.trialEnd);
      }
      else {
        return 'not found';
      }
    };

    function hasAccess(sessionId, accountUser) {
      var found = vm.sessionListManageRoles.accountUser.indexOf(accountUser.role);
      if(found > -1) {
        return true;
      }
      else {
        for(var i in accountUser.SessionMembers) {
          var member = accountUser.SessionMembers[i];
          if(member.sessionId == sessionId) {
            found = vm.sessionListManageRoles.sessionMember.indexOf(member.role);
            return (found > -1);
          }
        }
      }
    };

    function isExpired(user, date) {
      date = date || new Date();
      return (date > subscriptionEndDate(user));
    }

    function showStatus(session, user) {
      if(session.active) {
        var date = new Date();
        if(isExpired(user, date)) {
          return 'Expired';
        }
        else if(date < new Date(session.start_time)) {
          return 'Pending';
        }
        else {
          return 'Open';
        }
      }
      else {
        return 'Closed';
      }
    }
  };
})();
