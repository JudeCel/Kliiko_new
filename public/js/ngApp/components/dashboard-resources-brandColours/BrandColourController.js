(function () {
  'use strict';

  angular.module('KliikoApp').controller('BrandColourController', BrandColourController);
  BrandColourController.$inject = ['dbg', 'brandColourService', 'angularConfirm', 'messenger', 'ngProgressFactory'];

  function BrandColourController(dbg, brandColourService, angularConfirm, messenger, ngProgressFactory) {
    dbg.log2('#BrandColourController started');

    var vm = this;

  };
})();
