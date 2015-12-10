/**
 * @desc spinner directive that can be used anywhere across apps at a company named Acme
 * @example <div acme-shared-spinner></div>
 */
angular
    .module('KliikoApp')
    .directive('customSelectDirective', customSelectDirective);

function customSelectDirective() {
    var directive = {
        scope: {
            hi: '@hi'
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