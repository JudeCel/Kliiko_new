angular
    .module('KliikoApp')
    .directive('templateNameMask', templateNameMask);

function templateNameMask() {
    var directive = {
        restrict: 'A',
        scope: {
          template: '=templateNameMask'
        },
        link : function(scope, element, attrs) {
            scope.$watch('template', function() {
                element.val(getTemplateName(scope.template));
            });

            handleFocus(element, scope);
            handleBlur(element, scope);
        }
    };

    function getTemplateName(template) {
        return template.sessionId ? template.name + " - " + template.sessionName : template.name;
    }

    function handleFocus(element, scope) {
        element.focus(function() {
            element.val(scope.template.name);
        });
    }

    function handleBlur(element, scope) {
        element.blur(function() {
            scope.template.name = element.val();
            element.val(getTemplateName(scope.template));
        });
    }


    return directive;
}
