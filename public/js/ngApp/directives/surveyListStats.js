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

      scope.exportSurveyList = function(format) {
        if (scope.stats && scope.stats.surveys) {
          var list = scope.stats.surveys.map(function(item) {
            return item.data.survey.id;
          });
          return surveyServices.exportSurveyListStatsUrl(list, format);
        }
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
