(function () {
  'use strict';

  angular.module('KliikoApp').controller('ChatSessionsController', ChatSessionsController);

  ChatSessionsController.$inject = ['dbg', 'chatSessionsServices', 'messenger', 'angularConfirm', '$window', '$rootScope', 'domServices'];
  function ChatSessionsController(dbg, chatSessionsServices, messenger, angularConfirm, $window, $rootScope, domServices){
    dbg.log2('#ChatSessionsController started');

    var vm = this;

    vm.basePath = '/js/ngApp/components/dashboard-chatSessions/';

    vm.removeSession = removeSession;
    vm.copySession = copySession;
    vm.rateSessionMember = rateSessionMember;

    vm.changePage = changePage;
    vm.rowClass = rowClass;
    vm.hasAccess = hasAccess;
    vm.isExpired = isExpired;
    vm.isMember = isMember;
    vm.mouseOver = mouseOver;
    vm.redirectToChatSession = redirectToChatSession;
    vm.openModalWindow = openModalWindow;
    vm.closeModal = closeModal;
    vm.saveComment = saveComment;

    vm.disablePlayButton = false;
    vm.originalSession = {};

    vm.orderByField = 'name';
    vm.reverseSort = true;

    changePage('index');

    function init() {
      chatSessionsServices.findAllSessions().then(function(res) {
        vm.sessions = res.data;
        vm.dateFormat = res.dateFormat;
        vm.chatRoomUrl = res.chatRoomUrl;
        vm.sessionListManageRoles = res.sessionListManageRoles;
        dbg.log2('#ChatSessionsController > getChatSessions > res ', res.data);
      });
    }

    function openModalWindow(member) {
      vm.currentMemberModal = member;
      domServices.modal('chatSessionsModal');
    }

    function closeModal() {
      domServices.modal('chatSessionsModal', 1);
    }

    function saveComment() {
      chatSessionsServices.saveComment(vm.currentMemberModal).then(function(res) {
        messenger.ok(res.message);
        domServices.modal('chatSessionsModal', 1);
      }, function(error) {
        messenger.error(error);
      });
    }

    function isMember(facilitatorEmail, members, user) {
      var isMemeber = false;

      if(facilitatorEmail == user.email) {
        isMemeber = true;
      }else if (members) {
        members.map(function(member) {
          if(member.AccountUser.email == user.email) {
            isMemeber = true;
          }
        });
      }

      return isMemeber;
    }

    function redirectToChatSession(sessionId) {
      vm.disablePlayButton = true;
      chatSessionsServices.generateRedirectLink(sessionId).then(function(url) {
        $window.open(url);
        vm.disablePlayButton = false;
      }, function(error) {
        vm.disablePlayButton = false;
        messenger.error(error);
      });
    }

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
    }

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

    function rateSessionMember(sessionMember) {
      chatSessionsServices.rateSessionMember({ id: sessionMember.id, rating: sessionMember.rating }).then(function(res) {
        if(res.error) {
          messenger.error(chatSessionsServices.prepareError(res.error));
          for(var i in vm.originalSession.SessionMembers) {
            var member = vm.originalSession.SessionMembers[i];
            if(member.id == sessionMember.id) {
              sessionMember.rating = member.rating;
            }
          }
        }
        else {
          calculateSessionRating(vm.session);
        }
      });
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
      else if(page == 'sessionRating') {
        calculateSessionRating(session);
        vm.session = session;
        angular.copy(session, vm.originalSession);
        vm.currentPage = { page: page };
      }
    };

    function isExpired(session) {
      return session.showStatus == 'Expired';
    };

    function calculateSessionRating(session) {
      var rating = session.SessionMembers.reduce(function(sum, member) {
        return sum + member.rating;
      }, 0);
      vm.sessionRating = rating / (session.SessionMembers.length || 1);
      session.averageRating = vm.sessionRating;
    }

    function mouseOver() {
      return '/js/ngApp/components/dashboard-chatSessions/averageRating.html';
    }
  }
})();
