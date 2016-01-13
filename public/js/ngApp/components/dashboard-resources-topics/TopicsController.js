(function () {
  'use strict';

  angular.
  module('KliikoApp').
  controller('TopicsController', TopicsController);

  TopicsController.$inject = ['dbg'];
  function TopicsController(dbg) {
    dbg.log2('#TopicsController controller started');

    var vm = this;


  }


})();