angular
    .module('KliikoApp')
    .directive('surveyListStats', ['surveyServices', surveyListStats]);

function surveyListStats(surveyServices) {
  var directive = {
    restrict: 'E',
    scope: {
      stats: '=stats'
    },
    templateUrl: '/js/ngApp/directives/directiveTemplates/surveyListStats.tpl.html',
    link : function(scope, element, attrs) {
      scope.$watch('stats', function() {
        getTitle(scope);
      });

      scope.exportSessionUrl = function(format) {
        return scope.stats ? surveyServices.exportSessionStatsUrl(scope.stats.sessionId, format) : "";
      }
    }
  };

  function getTitle(scope) {
    if (scope.stats && scope.stats.surveys && scope.stats.surveys.length) {
      scope.title = scope.stats.surveys[0].data.survey.name;
    } else {
      scope.title = "Survey";
    }
  }

  return directive;
}
