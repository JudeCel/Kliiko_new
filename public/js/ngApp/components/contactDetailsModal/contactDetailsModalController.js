(function () {
  'use strict';

  angular.
    module('KliikoApp').
    controller('ContactDetailsModalController', ContactDetailsModalController);

  ContactDetailsModalController.$inject = ['dbg', 'user','domServices'];
  function ContactDetailsModalController(dbg,  user, domServices) {
    dbg.log2('#ContactDetailsModalController  started');
    var vm = this;

    vm.updateUserData = updateUserData;
    vm.cancel = cancel;

    init();

    function init() {
      // update form on every modal opening. will reset after 'cancel'
      jQuery('#contactDetailsModal').on('show.bs.modal', function (event) {
        // get all data for current user
        user.getUserData().then(function (res) {
          vm.userData = res;
        });
        vm.userDetailsForm.$setPristine();
        vm.userDetailsForm.$setUntouched();
      });

    }


    function updateUserData(data, form) {
      user.updateUserData(data, form).then(function (res) {
        vm.updateBtn = 'Updated';

        form.$setPristine();
        form.$setUntouched();

      });
    }

    function cancel(){
      domServices.modal('contactDetailsModal', 'close');
    }


  }


})();