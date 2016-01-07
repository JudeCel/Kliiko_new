/**
 * @desc empty input string directive to replace empty ng-models to ''
 * @example <div ng-string></div>
 */

angular
  .module('KliikoApp')
  .directive('ngString', ngString);

function ngString($parse) {
  return {
    require: '?ngModel',
    link: function (scope, element, attrs, ngModel) {
      var ngModelGet = $parse(attrs.ngModel);
      scope.$watch(attrs.ngModel, function () {
        if (ngModelGet(scope) == undefined && angular.isObject(ngModel) && (!attrs.type || attrs.type === 'text')) {
          var model = $parse(attrs.ngModel);
          model.assign(scope, '');
        }
      });
    }
  }
}
