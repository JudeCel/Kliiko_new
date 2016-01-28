(function () {
  'use strict';

  angular.
    module('KliikoApp').
    controller('ChatSessionsController', ChatSessionsController);

  ChatSessionsController.$inject = ['dbg', 'ChatSessionsServices', '$modal', 
                               '$scope', 'domServices', 'messenger', 
                               'globalSettings', '$sce', 'filterFilter'];

  function ChatSessionsController(dbg, ChatSessionsServices, $modal, $scope, domServices, messenger, globalSettings, $sce, filterFilter){
    dbg.log2('#ChatSessionsController  started');
    initList();

    function initList() {
      ChatSessionsServices.getChatSessions().then(function(res) {
        $scope.chatSessions = res.results
      });
    }

    $scope.deleteSession = function(session) {

      ChatSessionsServices.deleteSession(session.id).then(function(result) {
        if(result.error){
          messenger.error(result.error);
        }else{
          var index = $scope.chatSessions.indexOf(session);
          $scope.chatSessions.splice(index, 1);  
          messenger.ok(result.message);
        }
      })
    }

    $scope.copySession = function(sessionId) {
      ChatSessionsServices.copySession(sessionId).then(function(result) {
        if(result.error){
          messenger.error(result.error);
        }else{  
          $scope.chatSessions.push(result.session);
          messenger.ok(result.message);
        }
      })
    }
  }
})();
