(function () {
  'use strict';

  angular.
    module('KliikoApp').
    controller('GalleryController', GalleryController);

  GalleryController.$inject = ['dbg', 'user','domServices', 'ngProgressFactory', 'messenger'];
  function GalleryController(dbg,  user, domServices, ngProgressFactory, messenger) {
    dbg.log2('#GalleryController  started');
    var vm = this;

    initList();

    function initList() {

    }

  }

})();
