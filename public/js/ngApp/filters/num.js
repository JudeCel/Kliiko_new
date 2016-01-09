(function () {
  'use strict';

  /**
   * parseInt() for Views
   */

  angular.module('KliikoApp').filter('num', numFilter);

  function numFilter() {
    return function(input) {
      return parseInt(input, 10);
    }
  }


})();

