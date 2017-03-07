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
    vm.setOpen = setOpen;
    vm.openCopySessionDialog = openCopySessionDialog;
    vm.currentSelectedSessionName = "Untitled";
    vm.currentSelectedSessionPublicUrl = "";
    vm.baseUrl = null;

    vm.changePage = changePage;
    vm.initRowClass = initRowClass;
    vm.hasAccess = hasAccess;
    vm.redirectToChatSession = redirectToChatSession;
    vm.changeOrder = changeOrder;
    vm.prepareSessionsPagination = prepareSessionsPagination;
    vm.getSessionTypeName = getSessionTypeName;
    vm.initShouldShowStatusLabel = initShouldShowStatusLabel;
    vm.initIsOpen = initIsOpen;
    vm.setOpen = setOpen;
    vm.showStats = showStats;
    vm.showPublicUrl = showPublicUrl;

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
      sessions: []
    }

    var confirmCopySessionDialog = "copySessionConfirm";

    changePage('index');

    function init() {
      chatSessionsServices.findAllSessions().then(function(res) {
        vm.queriedForSessions = true;
        vm.sessions = res.data;
        vm.baseUrl = res.baseUrl;
        vm.dateFormat = res.dateFormat;
        vm.chatRoomUrl = res.chatRoomUrl;
        vm.sessionListManageRoles = res.sessionListManageRoles;
        prepareSessionsPagination();
        dbg.log2('#ChatSessionsController > getChatSessions > res ', res.data);
      });
    }

    function prepareSessionsPagination() {
      if (vm.sessions && vm.sessions.length > 0) {
        vm.pagination.currentPage = getCurrentPage();
        vm.pagination.sessions = getSessions();
        vm.pagination.totalChatSessions = vm.sessions.length;

      } else {
        vm.pagination.sessions = [];
      }

      function getSessions() {
        var sliceStart = (vm.pagination.currentPage - 1) * vm.pagination.itemsPerPage;
        var sliceEnd =  vm.pagination.currentPage * vm.pagination.itemsPerPage;
        return vm.sessions.slice(sliceStart, sliceEnd);
      }

      function getCurrentPage() {
        if (!isOnFirstPage() && isRemovedLastSessionOnCurrentPage()) {
          return --vm.pagination.currentPage;
        } else if (isAddingItemToNewPage()) {
          return ++vm.pagination.currentPage;
        } else {
          return vm.pagination.currentPage;
        }
      }

      function isAddingItemToNewPage() {
        var isAddingItem = vm.sessions.length > vm.pagination.totalChatSessions;
        var isCurrentPageFull = vm.pagination.sessions.length == vm.pagination.itemsPerPage;
        return isAddingItem && isCurrentPageFull;
      }

      function isRemovedLastSessionOnCurrentPage() {
        var isRemoved = vm.sessions.length < vm.pagination.totalChatSessions;
        var isLastOnPage = vm.pagination.sessions.length == 1;
        return isRemoved && isLastOnPage;
      }

      function isOnFirstPage() {
         return vm.pagination.currentPage == 1;
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
            prepareSessionsPagination();
          }
        });
      });
    }

    function openCopySessionDialog(session) {
      vm.currentSelectedSession = session;
      if (vm.currentSelectedSession.name) {
        vm.currentSelectedSessionName = vm.currentSelectedSession.name
      }
      domServices.modal(confirmCopySessionDialog);
    }

    function showName(name) {
      return name || "Untitled";
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
            prepareSessionsPagination();
          }

          domServices.modal(confirmCopySessionDialog, 'close');
        });
      }
    };

    function initRowClass(session) {
      session.rowClass = 'session-' + session.showStatus.toLowerCase();
    }

    function hasAccess(session, accountUserId) {
      var canAccess = false;
      if(session.facilitator && (session.facilitator.accountUserId == accountUserId) || session.isInactive){
        canAccess = true;
      } else {
        session.SessionMembers.map(function(member) {
          member.accountUserId == accountUserId;
          canAccess = true;
          return false;
        });
      };

      return canAccess;
    };

    function changePage(page, session) {
      if(page == 'index') {
        init();
        vm.currentPage = { page: page };
      }
    };

    function getSessionTypeName(session) {
      if (session.type) {
        var str = session.type.replace( /([A-Z])/g, " $1" );
        return str.charAt(0).toUpperCase() + str.slice(1);
      } else {
        return "";
      }
    }

    function setOpen(session) {
      chatSessionsServices.setOpen(session.id, session.isOpen).then(function(res) {
        if (res.error) {
          messenger.error(res.error);
        } else {
          session.status = res.data.status;
          session.showStatus = res.data.showStatus;
        }
        initIsOpen(session);
        initRowClass(session);
      });
    }

    function initIsOpen(session) {
      session.isOpen = session.status == "open";
    }

    function showStats(session) {
      //todo:
      //will be implemented in TA1592
    }

    function showPublicUrl(session) {
      if (session.publicUid) {
        vm.currentSelectedSessionPublicUrl = vm.baseUrl + "/session/" + session.publicUid;
        domServices.modal("publicUrlModal");
      }
    }

    function initShouldShowStatusLabel(session) {
      var typeFeatures = session.SessionType.properties.features;
      if (typeFeatures.closeSessionToggle.enabled && (!typeFeatures.publish.enabled || session.publicUid)) {
        session.showStatusLabel = false;
        initIsOpen(session);
      } else {
        session.showStatusLabel = true;
      }
    }

  }
})();
