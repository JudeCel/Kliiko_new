angular
    .module('KliikoApp')
    .directive('klziiTooltip', klziiTooltip);

function klziiTooltip() {
    var directive = {
        restrict: 'E',
        scope: {
          tooltipText: '@tooltipText'
        },
        templateUrl: '/js/ngApp/directives/klzii-tooltip-directive.tpl.html',
        link : function(scope, element, attrs) {
          var tooltipButton = element.find(".tooltip-button");
          var tooltipContainer = element.find('.tooltip-outer-container');

          tooltipButton.on('click', function() {
            adjustTooltipContainerPosition(tooltipButton, tooltipContainer);
            tooltipContainer.toggle();
          });

          $(window).resize(function() {
            adjustTooltipContainerPosition(tooltipButton, tooltipContainer);
          });

        }
    };

    return directive;

    function adjustTooltipContainerPosition(tooltipButton, tooltipContainer) {
      var leftDelta = 123;
      var topDelta = 115;
      var position = tooltipButton.position();
      var left = position.left - leftDelta;
      var top = position.top - topDelta;
      tooltipContainer.css(
      {
          left: left,
          top: top,
          position: 'absolute'
      });
    }
}
