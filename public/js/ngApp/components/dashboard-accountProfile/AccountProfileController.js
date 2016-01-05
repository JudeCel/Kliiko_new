(function () {
  'use strict';

  angular.
  module('KliikoApp').
  controller('AccountProfileController', AccountProfile);

  AccountProfile.$inject = ['dbg','user'];
  function AccountProfile(dbg, user) {
    dbg.log2('#AccountProfile controller started');

    var vm = this;

    init();

    function init() {
      user.canAccess('bannerMessages').
        then(
          function(res) { vm.bannerMessageIsAccessible = true; },
          function(err) { vm.bannerMessageIsAccessible = false; }
        );
    }

  }


})();