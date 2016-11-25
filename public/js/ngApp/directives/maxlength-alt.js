angular.module('KliikoApp').directive('altMaxlength', function() {
  return {
    require: 'ngModel',
    link: function (scope, element, attrs, ngModelCtrl) {
      function fromUser(text) {
        var selectionEnd = element.context.selectionEnd;
        var prevValue = ngModelCtrl.$modelValue || "";
        var maxlength = Number(attrs.altMaxlength);
        if (text.length > maxlength && text.length > prevValue.length) {
          ngModelCtrl.$setViewValue(prevValue);
          ngModelCtrl.$render();
          element.context.selectionStart = element.context.selectionEnd = selectionEnd - (text.length - prevValue.length);
          return prevValue;
        } else {
          return text;
        }
      }
      ngModelCtrl.$parsers.push(fromUser);
    }
  };
});
