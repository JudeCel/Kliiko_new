angular
  .module('KliikoApp')
  .directive('isolateClick', isolateClick);

function isolateClick() {
    return {
        link: function(scope, element) {
            element.on('click', function(e){
                e.stopPropagation();
            });
        }
   };
}
