angular.module('KliikoApp').directive('altMaxlength', function() {
  return {
    require: 'ngModel',
    link: function (scope, element, attrs, ngModelCtrl) {
      var maxlength = Number(attrs.altMaxlength);
      function fromUser(text) {
        var selectionEnd = element.context.selectionEnd;
        var prevValue = ngModelCtrl.$modelValue;
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
