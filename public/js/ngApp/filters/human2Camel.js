(function () {
  'use strict';

  angular.module('KliikoApp').filter('human2Camel', human2CamelFilter);

  function human2CamelFilter() {
    return function(input, reverse) {

      var output = input;
      reverse
        ? human2Camel()
        : camel2Human();

      function camel2Human() {
        output = output.replace(/(?:^\w|[A-Z]|\b\w)/g, function(letter, index) {
          return index == 0 ? letter.toLowerCase() : letter.toUpperCase();
        }).replace(/\s+/g, '');
      }

      function human2Camel() {
        output = output.
        // insert a space before all caps
        replace(/([A-Z])/g, ' $1').
        // uppercase the first character
        replace(/^./, function(str){ return str.toUpperCase(); });


      }

      return output;

    }
  }


})();
