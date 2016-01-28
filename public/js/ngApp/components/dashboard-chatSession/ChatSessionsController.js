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
        dbg.yell(res)
        $scope.chatSessions = res.data;
      });
    }

  }
})();
