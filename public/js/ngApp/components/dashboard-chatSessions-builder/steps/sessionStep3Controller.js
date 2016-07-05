(function () {
  'use strict';

  angular.module('KliikoApp').controller('SessionStep3Controller', SessionStep3Controller);

  SessionStep3Controller.$inject = ['dbg', 'sessionBuilderControllerServices', 'messenger', '$state',  '$filter', '$scope', 'SessionModel'];
  function SessionStep3Controller(dbg, builderServices, messenger, $state, $filter, $scope, SessionModel) {
    dbg.log2('#SessionBuilderController 3 started');
    var vm = this;
    vm.mailTemplateList = [];
    vm.session = builderServices.session;

    vm.getPreparedMailTemplateList = function() {
      vm.session.getSessionMailTemplateStatus().then(function(res) {
        vm.mailTemplateList = res.templates;
      }, function (err) {
        messenger.error(err);
      });
    }

    vm.isTemplateRequired = function(template) {
      if (template.name == "Generic") {
        return "(optional)";
      } else {
        return "*";
      }
    }

    vm.getPreparedMailTemplateList();

  }

})();
