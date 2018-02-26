(function () {
  'use strict';

  angular.module('KliikoApp').filter('yesOrNo', yesOrNo);

  function yesOrNo() {
    return function(input) {
      return input ? 'Yes' : 'No';
    }
  }
})();
