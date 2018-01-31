(function () {
  'use strict';

  angular.module('KliikoApp').controller('ResourcesController', ResourcesController);
  ResourcesController.$inject = ['dbg', '$location', 'user'];

  function ResourcesController(dbg, $location, user) {
    dbg.log2('#ResourcesController started');

    init();

    function init() {
      if (!user.app.hasPermissions('hasBoughtSessions')) {
        $location.path('/account-profile');
      }
    }

  }
})();
