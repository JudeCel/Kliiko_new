(function () {
  'use strict';

  angular.module('KliikoApp').controller('MessengerController', MessengerController)
  angular.module('KliikoApp.Root').controller('MessengerController', MessengerController)

  MessengerController.$inject = ['messenger', '$timeout', '$scope'];
  function MessengerController(messenger, $timeout, $scope) {

    var vm = this;
    vm.error = error;
    vm.message = message;

    function error(msg, afterTimeout) {
      show(messenger.error, msg, afterTimeout);
    }

    function message(msg, afterTimeout) {
      show(messenger.ok, msg, afterTimeout);
    }

    function show(func, msg, afterTimeout) {
      $timeout(function() {
        func(msg);
      }, afterTimeout ? 500 : 0);
    }
  }
})();

