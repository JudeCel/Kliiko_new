/**
 * @desc directive is designed to save element viewport state (whether it's shown in viewport or not)
 * @example
 *  <div is-in-viewport='yourVariable'>
 *  </div>
 */
angular
    .module('KliikoApp')
    .directive('isInViewport', isInViewport);

function isInViewport() {
    var directive = {
        restrict: 'A',
        scope: {
          isInViewport: '='
        },
        link : function(scope, element) {
          $(window).scroll(function() {
            scope.isInViewport = isElementInViewPort(element[0]);
          });
        }
    };

    return directive;

    function isElementInViewPort(element) {
      if (element instanceof jQuery) {
          throw "Input parameter 'element' must be a raw DOM element. Please try to use element[0]."
      }

      var rectangle = element.getBoundingClientRect();
      return (
        rectangle.top >= 0 && rectangle.left >= 0 && rectangle.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rectangle.right <= (window.innerWidth || document.documentElement.clientWidth)
      );
    }
}
