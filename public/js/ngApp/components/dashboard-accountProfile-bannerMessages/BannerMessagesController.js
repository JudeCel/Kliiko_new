(function () {
  'use strict';

  angular.
    module('KliikoApp').
    controller('BannerMessagesController', BannerMessagesController);

  BannerMessagesController.$inject = ['dbg'];
  function BannerMessagesController(dbg) {
    dbg.log2('#BannerMessagesController controller started');

    var vm = this;


  }


})();