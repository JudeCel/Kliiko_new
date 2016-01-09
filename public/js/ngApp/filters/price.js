(function () {
  'use strict';

  /**
   * Convert all prices to one visible type.
   * Where 1000 will be US$10.00
   */

  angular.module('KliikoApp').filter('price', priceFilter);

  priceFilter.$inject = ['$filter'];
  function priceFilter($filter) {
    return function(amount, symbol, register) {
      if (typeof symbol == "undefined") {symbol = '$US'}
      if (typeof register == "undefined") {register = 2}

      return $filter('currency')(amount / 100, symbol, register);
    }
  }


})();

