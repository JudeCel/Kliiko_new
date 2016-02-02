/**
 * @desc custom select dropdown
 * @example
 *  <div custom-select-directive data-title="">
 *    <li ng-click="yourAction()>Just  do it!</li>
 *  </div>
 */
angular
    .module('KliikoApp')
    .directive('customSelectDirective', customSelectDirective);

function customSelectDirective() {
    var directive = {
        scope: {
            title: '@title'
        },
        link: link,
        restrict: 'EA',
        replace: false,
        transclude: true,
        templateUrl: 'js/ngApp/directives/custom-select-directive.tpl.html',
        controller: controller,
    };
    return directive;

    function controller($scope) {
        $scope.toggle = false;
    }

    function link(scope, element, attrs) {

    }

}

