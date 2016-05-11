(function () {
  'use strict';

  angular.module('KliikoApp').controller('ContactDetailsModalController', ContactDetailsModalController)

  ContactDetailsModalController.$inject = ['dbg', 'user', 'domServices', 'messenger', '$scope'];
  function ContactDetailsModalController(dbg, user, domServices, messenger, $scope) {
    dbg.log2('#ContactDetailsModalController started');

    var vm = this;

    vm.userData = {};
    vm.updateUserData = updateUserData;
    vm.cancel = cancel;

    $('#contactDetailsModal').on('show.bs.modal', function (event) {
      vm.userDetailsForm.$setPristine();
      vm.userDetailsForm.$setUntouched();

      vm.errors = {};
      vm.userData = angular.copy(user.user);
      delete vm.userData.id;
      $scope.$apply();
    });

    function updateUserData() {
      user.updateUserData(vm.userData).then(function(res) {
        vm.updateBtn = 'Updated';
        vm.userDetailsForm.$setPristine();
        vm.userDetailsForm.$setUntouched();
        vm.errors = {};
        messenger.ok('Contact details updated successfully.');
      }, function(error) {
        vm.errors = error;
      });
    }

    function cancel(){
      domServices.modal('contactDetailsModal', 'close');
    }
  }
})();
