(function () {
  'use strict';

  angular.module('KliikoApp').controller('EmailNotificationModalController', EmailNotificationModalController)
  angular.module('KliikoApp.Root').controller('EmailNotificationModalController', EmailNotificationModalController)

  EmailNotificationModalController.$inject = ['dbg', 'user', 'domServices', 'messenger'];
  function EmailNotificationModalController(dbg, user, domServices, messenger) {
    dbg.log2('#EmailNotificationModalController started');

    var vm = this;

    vm.accountUserData = {};
    vm.save = save;
    vm.cancel = cancel;

    $('#emailNotificationModal').on('show.bs.modal', function (event) {
      vm.accountUserData = {emailNotification: user.app.accountUser.emailNotification};
      vm.errors = {};
    });

    function save(dashboardController) {
      user.updateUserData(vm.accountUserData).then(function(res) {
        vm.errors = {};
        messenger.ok(res.message);
        cancel();
      }, function(error) {
        vm.errors = error;
        messenger.error(error);
      });
    }

    function cancel(){
      domServices.modal('emailNotificationModal', 'close');
    }
  }
})();
