(function () {
  'use strict';

  angular.module('KliikoApp').controller('SessionBuilderController', SessionBuilderController);

  SessionBuilderController.$inject = ['dbg', 'messenger'];
  function SessionBuilderController(dbg, messenger) {
    dbg.log2('#SessionBuilderController started');

    var vm = this;
    vm.basePath = '/js/ngApp/components/dashboard-chatSessions-builder/';

    alert(1);


  }
})();
