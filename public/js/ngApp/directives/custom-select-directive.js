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
            title: '@title',
            id: '@id'
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

        element.ready(function(){


            function DropDown(el) {
                this.dd = el;
                this.initEvents();
            }
            DropDown.prototype = {
                initEvents : function() {
                    var obj = this;

                    obj.dd.on('click', function(event){
                        $(this).toggleClass('active');
                        event.stopPropagation();
                    });
                }
            };

            // timeout to give app time to find element
            setTimeout(findElementAndRun, 10);

            function findElementAndRun() {
                var dd = new DropDown( jQuery('#'+scope.id) );

                jQuery(document).click(function() {
                    // all dropdowns
                    jQuery('.wrapper-dropdown-cd').removeClass('active');
                });
            }





        });


    }

}
