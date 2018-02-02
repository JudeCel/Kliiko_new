(function () {
  'use strict';

  angular.module('KliikoApp').controller('AccountProfileMainController', AccountProfileMainController);
  AccountProfileMainController.$inject = ['dbg', '$confirm', '$location', 'user'];

  function AccountProfileMainController(dbg, $confirm, $location, user) {
    dbg.log2('#AccountProfileMainController started');

    init();

    function init() {
      var currentURL = $location.path();
      var checkoutPageURL = '/account-profile/upgrade-plan';
      var showBuySessionModal = !user.app.hasPermissions('hasBoughtSessions') &&  currentURL !== checkoutPageURL;
      if (showBuySessionModal) {
        $confirm({
          title: "Great to see you back!",
          close: "OK",
          text: 'To start a new Chat Session, click on the Buy More Session Button.',
          closeOnly: true,
          choice: true,
        });
      }
    }

  }
})();
