(function () {
  'use strict';

  angular.module('KliikoApp').controller('CreateNewAccountModalController', CreateNewAccountModalController)
  angular.module('KliikoApp.Root').controller('CreateNewAccountModalController', CreateNewAccountModalController)

  CreateNewAccountModalController.$inject = ['dbg', 'account', 'domServices', 'messenger', '$scope'];
  function CreateNewAccountModalController(dbg, account, domServices, messenger, $scope) {
    dbg.log2('#CreateNewAccountModalController started');

    var vm = this;

    vm.accountData = {};
    vm.createNewAccount = createNewAccount;
    vm.cancel = cancel;

    $('#createNewAccountModal').on('show.bs.modal', function (event) {
      vm.accountData = {accountName: ''};
      vm.errors = {};
    });

    function createNewAccount() {
      account.createNewAccount(vm.accountData).then(function(res) {
        vm.accountData = {};
        messenger.ok(res.message);
        cancel();
      }, function(error) {
        vm.errors = error;
        messenger.error(error);
      });
    }

    function cancel(){
      domServices.modal('createNewAccountModal', 'close');
    }
  }
})();
