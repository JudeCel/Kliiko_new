(function () {
  'use strict';

  angular.
    module('KliikoApp').
    controller('ContactDetailsModalController', ContactDetailsModalController);

  ContactDetailsModalController.$inject = ['dbg', 'user','domServices', 'ngProgressFactory', 'messenger'];
  function ContactDetailsModalController(dbg,  user, domServices, ngProgressFactory, messenger) {
    dbg.log2('#ContactDetailsModalController  started');
    var vm = this;

    vm.updateUserData = updateUserData;
    vm.cancel = cancel;

    init();

    function init() {
      vm.progressbar = ngProgressFactory.createInstance();

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

        messenger.ok('Saved!');

        form.$setPristine();
        form.$setUntouched();

      });
    }

    function cancel(){
      domServices.modal('contactDetailsModal', 'close');
    }


  }


})();