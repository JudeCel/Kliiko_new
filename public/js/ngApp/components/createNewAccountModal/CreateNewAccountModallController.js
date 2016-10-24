(function () {
  'use strict';

  angular.module('KliikoApp').controller('CreateNewAccountModallController', CreateNewAccountModallController)
  angular.module('KliikoApp.Root').controller('CreateNewAccountModallController', CreateNewAccountModallController)

  CreateNewAccountModallController.$inject = ['dbg', 'user', 'account', 'domServices', 'messenger', '$scope'];
  function CreateNewAccountModallController(dbg, user, domServices, messenger, $scope) {
    dbg.log2('#CreateNewAccountModallController started');

    var vm = this;

    vm.userData = {};
    vm.createNewAccount = createNewAccount;
    vm.cancel = cancel;

    $('#createNewAccountModal').on('show.bs.modal', function (event) {
      vm.createNewAccountForm.$setPristine();
      vm.createNewAccountForm.$setUntouched();

      vm.errors = {};
      vm.userData = angular.copy(user.user);
      delete vm.userData.id;
      $scope.$apply();
    });

    function createNewAccount() {
      account.createNewAccount(vm.userData).then(function(res) {
        vm.createNewAccountForm.$setPristine();
        vm.createNewAccountForm.$setUntouched();
        vm.errors = {};
        messenger.ok(res.message);
        domServices.modal('createNewAccountModal', 'close');
      }, function(error) {
        vm.errors = error;
      });
    }

    function cancel(){
      domServices.modal('createNewAccountModal', 'close');
    }
  }
})();
