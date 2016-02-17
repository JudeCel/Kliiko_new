(function () {
  'use strict';

  angular.module('KliikoApp').controller('SessionRatingController', SessionRatingController);
  SessionRatingController.$inject = ['dbg', 'AccountDatabaseServices', '$modal', '$scope', '$rootScope', '$filter', 'angularConfirm', 'messenger', 'SessionRatingServices'];

  function SessionRatingController(dbg, AccountDatabaseServices, $modal, $scope, $rootScope, $filter, angularConfirm, messenger, SessionRatingServices) {
    dbg.log2('#SessionRatingController started');
    var vm = this;
    vm.open = true;
    init();

    function init() {
      SessionRatingServices.findAllSessions().then(function(res) {
        vm.sessions = res.data;
        vm.dateFormat = res.dateFormat;
        vm.chatRoomUrl = res.chatRoomUrl;
        vm.sessionListManageRoles = res.sessionListManageRoles;
        dbg.log2('#ChatSessionsController > getChatSessions > res ', res.data);
      });
    };

  };
})();
