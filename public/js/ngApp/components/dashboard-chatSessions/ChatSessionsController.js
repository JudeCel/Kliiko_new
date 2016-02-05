(function () {
  'use strict';

  angular.module('KliikoApp').controller('ChatSessionsController', ChatSessionsController);
  ChatSessionsController.$inject = ['dbg', 'chatSessionsServices', 'messenger', 'angularConfirm'];

  function ChatSessionsController(dbg, chatSessionsServices, messenger, angularConfirm){
    dbg.log2('#ChatSessionsController started');

    var vm = this;
    vm.removeSession = removeSession;
    vm.copySession = copySession;

    vm.showStatus = showStatus;

    initList();

    function initList() {
      chatSessionsServices.findAllSessions().then(function(res) {
        vm.sessions = res.data;
        vm.dateFormat = res.dateFormat;
        dbg.log2('#ChatSessionsController > getChatSessions > res ', res.data);
      });
    }

    function removeSession(session) {
      angularConfirm('Are you sure you want to remove Session?').then(function(response) {
        chatSessionsServices.removeSession({ sessionId: session.id }).then(function(res) {
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
      chatSessionsServices.copySession({ sessionId: session.id }).then(function(res) {
        if(res.error) {
          messenger.error(chatSessionsServices.prepareError(res.error));
        }
        else {
          messenger.ok(res.message);
          vm.sessions.push(res.data);
        }
      });
    }

    function showStatus(session) {
      if(session.active) {
        var date = new Date();
        if(date > new Date(session.end_time)) {
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
  }
})();
