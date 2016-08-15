angular.module('KliikoApp').directive('messagesDirective', ['messenger', messagesDirective]);

function messagesDirective(messenger) {
  return {
    restrict: 'A',
    link: function(scope, element, attr) {
      element.on('click', function(){
        switch(attr.messagesDirective) {
          case 'clear':
            messenger.clear();
            break;
          case 'skip':
            messenger.changeSkip(true);
            break;
          default:

        }
      });
    }
  };
}
