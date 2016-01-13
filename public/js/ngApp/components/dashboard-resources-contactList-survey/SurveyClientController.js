(function () {
  'use strict';

  angular.module('KliikoApp.Root').controller('SurveyClientController', SurveyClientController);
  SurveyClientController.$inject = ['dbg', 'surveyServices', 'angularConfirm', 'messenger', '$scope'];

  function SurveyClientController(dbg, surveyServices, angularConfirm, messenger, $scope) {
    dbg.log2('#SurveyClientController started');

    var vm = this;
    vm.manage = { survey: { SurveyQuestions: [] } };

    init();

    function init() {
      surveyServices.findSurvey({ id: 1 }).then(function(res) {
        vm.manage.survey = res.data;
        createPages();
        dbg.log2('#SurveyClientController > findSurvey > res ', res.data);
      });
    };

    function createPages() {
      var page = 0, perPage = 3;
      vm.previewPages = {};
      vm.previewPagesInfo = { current: 0 };
      for(var i in vm.manage.survey.SurveyQuestions) {
        var num = parseInt(i) + 1;
        if(!vm.previewPages[page]) {
          vm.previewPages[page] = [];
        }

        vm.previewPages[page].push(vm.manage.survey.SurveyQuestions[num - 1]);
        if((num % perPage) == 0) {
          page++;
          perPage = (page < 2) ? 3 : 100;
        }
      }

      vm.previewPagesInfo.total = Object.keys(vm.previewPages).length - 1;
    };
  };
})();
