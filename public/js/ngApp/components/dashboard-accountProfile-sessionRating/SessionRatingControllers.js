(function () {
  'use strict';

  angular.module('KliikoApp').controller('SessionRatingController', SessionRatingController);
  SessionRatingController.$inject = ['dbg', 'SessionRatingServices'];

  function SessionRatingController(dbg, SessionRatingServices) {
    dbg.log2('#SessionRatingController started');
    var vm = this;
    vm.accounts = [];
    init();

    function init() {
      SessionRatingServices.findAllSessions().then(function(res) {
        vm.accounts = res.data;
      });
    };
  };
})();
