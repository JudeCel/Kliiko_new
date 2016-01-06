(function () {
  'use strict';

  angular.module('KliikoApp').controller('SurveyController', SurveyController);
  SurveyController.$inject = ['dbg', 'surveyServices', 'angularConfirm', 'messenger'];

  function SurveyController(dbg, surveyServices, angularConfirm, messenger) {
    dbg.log2('#SurveyController started');

    var vm = this;
    vm.surveys = {};

    vm.removeSurvey = removeSurvey;
    vm.changeStatus = changeStatus;
    vm.statusIcon = statusIcon;
    init();

    function init() {
      surveyServices.getAllSurveys().then(function(res) {
        vm.surveys = res.data;
        dbg.log2('#SurveyController > getAllSurveys > res ', res.data);
      });
    };

    function removeSurvey(survey) {
      angularConfirm('Are you sure you want to remove Survey?').then(function(response) {
        surveyServices.removeSurvey({ id: survey.id }).then(function(res) {
          dbg.log2('#SurveyController > removeSurvey > res ', res);
          if(res.error) {
            messenger.error(res.error);
          }
          else {
            messenger.ok(res.data);
            var index = vm.surveys.indexOf(survey);
            vm.surveys.splice(index, 1);
          }
        });
      });
    };

    function changeStatus(survey) {
      surveyServices.changeStatus({ id: survey.id, closed: !survey.closed }).then(function(res) {
        dbg.log2('#SurveyController > changeStatus > res ', res);
        if(res.error) {
          messenger.error(res.error);
        }
        else {
          survey.closed = !survey.closed;
          messenger.ok("Survey has been successfully " + (survey.closed ? 'closed' : 'opened'));
        }
      });
    };

    function statusIcon(survey) {
      if(survey.closed) {
        return '/icons/password_red.png';
      }
      else {
        return '/icons/password_grey.png';
      }
    }
  };
})();
