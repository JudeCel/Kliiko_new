angular.module('KliikoApp').directive('altMaxlength', function() {
  return {
    require: 'ngModel',
    link: function (scope, element, attrs, ngModelCtrl) {
      function fromUser(text) {
        var selectionEnd = element.context.selectionEnd;
        var prevValue = ngModelCtrl.$modelValue || "";
        var maxlength = Number(attrs.altMaxlength);
        if (text.length > maxlength && text.length > prevValue.length) {
          if (prevValue.length >= maxlength) {
            ngModelCtrl.$setViewValue(prevValue);
            ngModelCtrl.$render();
            element.context.selectionStart = element.context.selectionEnd = selectionEnd - (text.length - prevValue.length);
            return prevValue;
          } else {
            var diff = text.length - maxlength;
            text = text.substr(0, selectionEnd - diff) + text.substr(selectionEnd);
            ngModelCtrl.$setViewValue(text);
            ngModelCtrl.$render();
            element.context.selectionStart = element.context.selectionEnd = selectionEnd - (diff);
            return text;
          }          
        } else {
          return text;
        }
      }
      ngModelCtrl.$parsers.push(fromUser);
    }
  };
});
