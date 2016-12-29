(function () {
  'use strict';

  angular.module('KliikoApp').controller('ChatSessionsController', ChatSessionsController);

  ChatSessionsController.$inject = ['dbg', 'chatSessionsServices', 'goToChatroom', 'messenger', 'angularConfirm', '$window', '$rootScope', 'domServices', '$confirm'];
  function ChatSessionsController(dbg, chatSessionsServices, goToChatroom, messenger, angularConfirm, $window, $rootScope, domServices, $confirm){
    dbg.log2('#ChatSessionsController started');

    var vm = this;

    vm.basePath = '/js/ngApp/components/dashboard-chatSessions/';

    vm.removeSession = removeSession;
    vm.copySession = copySession;

    vm.changePage = changePage;
    vm.rowClass = rowClass;
    vm.hasAccess = hasAccess;
    vm.redirectToChatSession = redirectToChatSession;
    vm.changeOrder = changeOrder;
    vm.prepareCurrentPageSessions = prepareCurrentPageSessions;

    vm.disablePlayButton = false;
    vm.originalSession = {};

    vm.orderByField = 'id';
    vm.inAction = false;
    vm.reverseSort = false;
    vm.queriedForSessions = false;

    vm.pagination = {
      totalChatSessions: 0,
      currentPage: 1,
      itemsPerPage: 10,
      sessions: {}
    }

    changePage('index');

    function init() {
      chatSessionsServices.findAllSessions().then(function(res) {
        vm.queriedForSessions = true;
        vm.sessions = res.data;
        vm.dateFormat = res.dateFormat;
        vm.chatRoomUrl = res.chatRoomUrl;
        vm.sessionListManageRoles = res.sessionListManageRoles;
        vm.pagination.totalChatSessions = res.data.length;
        prepareCurrentPageSessions();
        dbg.log2('#ChatSessionsController > getChatSessions > res ', res.data);
      });
    }

    function prepareCurrentPageSessions() {
      if (vm.sessions && vm.sessions.length > 0) {
        var sliceStart = (vm.pagination.currentPage - 1) * vm.pagination.itemsPerPage;
        var sliceEnd =  vm.pagination.currentPage * vm.pagination.itemsPerPage;
        vm.pagination.sessions = vm.sessions.slice(sliceStart, sliceEnd);
      } else {
        vm.pagination.sessions = {};
      }
    }

    function changeOrder(type) {
      vm.reverseSort = !vm.reverseSort;
      vm.orderByField = vm.reverseSort ? '+' + type : '-' + type;
    }

    function redirectToChatSession(sessionId) {
      vm.disablePlayButton = true;

      goToChatroom.go(sessionId).then(function(url) {
        vm.disablePlayButton = false;
      }, function(error) {
        vm.disablePlayButton = false;
      });
    }

    function removeSession(session) {
      $confirm({ text: "You want to Delete this Session?" }).then(function() {
        chatSessionsServices.removeSession({ id: session.id }).then(function(res) {
          if(res.error) {
            messenger.error(res.error);
          } else {
            messenger.ok(res.message);
            var index = vm.sessions.indexOf(session);
            vm.sessions.splice(index, 1);
          }
        });
      });
    }

    function copySession(session) {
      if(!vm.inAction) {
        vm.inAction = true;

        chatSessionsServices.copySession({ id: session.id }).then(function(res) {
          vm.inAction = false;
          if(res.error) {
            messenger.error(res.error);
          }
          else {
            messenger.ok(res.message);
            vm.sessions.push(res.data);
          }
        });
      }
    };

    function rowClass(session, user) {
      return 'session-' + session.showStatus.toLowerCase();
    }

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

    function changePage(page, session) {
      if(page == 'index') {
        init();
        vm.currentPage = { page: page };
      }
    };

  }
})();
