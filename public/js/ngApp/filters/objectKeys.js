(function () {
  'use strict';

  /**
   * Object.keys() for Views
   */
  angular.module('KliikoApp').filter('objectKeys', objectKeysFilter);

  function objectKeysFilter() {
    return function(inputObj) {
      if (!angular.isObject(inputObj) ) return [];

      return Object.keys(inputObj);
    }
  }


})();

