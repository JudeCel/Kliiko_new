(function () {
  'use strict';

  angular.module('KliikoApp').controller('SessionStep3Controller', SessionStep3Controller);

  SessionStep3Controller.$inject = ['dbg', 'sessionBuilderControllerServices', 'messenger', '$state',  '$filter', '$scope', 'SessionModel'];
  function SessionStep3Controller(dbg, builderServices, messenger, $state, $filter, $scope, SessionModel) {
    dbg.log2('#SessionBuilderController 3 started');

  }

})();
