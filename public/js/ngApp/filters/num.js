(function () {
  'use strict';

  /**
   * parseInt() || parseFloat() for Views
   * usage example:
   *  {{ '12.1234px | num }} => 12
   *  {{ '12.1234USD | num:2 }} => 12.12
   */

  angular.module('KliikoApp').filter('num', numFilter);

  function numFilter() {
    return function(input, toFixed) {
      var output;
      (toFixed)
        ? output = parseFloat(input).toFixed(toFixed)
        : output = parseInt(input, 10);

      return output;
    }
  }


})();

