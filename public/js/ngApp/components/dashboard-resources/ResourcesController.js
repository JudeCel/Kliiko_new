(function () {
  'use strict';

  angular.
  module('KliikoApp').
  controller('ResourcesController', ResourcesController);

  ResourcesController.$inject = ['dbg'];
  function ResourcesController(dbg) {
    dbg.log2('#ResourcesController controller started');

    var vm = this;



  }


})();