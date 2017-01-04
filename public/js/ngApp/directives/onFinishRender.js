/**
 * @desc directive is designed track if we render last element To notify about render completion
 * @example
 *  <div ng-repeat.....  on-finish-render='fourFunctionCall'>
 *  </div>
 */
angular
    .module('KliikoApp')
    .directive('onFinishRender', onFinishRender);

function onFinishRender() {
    var directive = {
        restrict: 'A',
        link: function (scope, element, attr) {
          if (scope.$last === true) {
            scope.$evalAsync(attr.onFinishRender);
          }
        }
    };

    return directive;
}
