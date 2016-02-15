(function () {
  'use strict';

  angular.
    module('KliikoApp').
    controller('ContactDetailsModalController', ContactDetailsModalController);

  ContactDetailsModalController.$inject = ['dbg', 'user','domServices', 'ngProgressFactory', 'messenger'];
  function ContactDetailsModalController(dbg,  user, domServices, ngProgressFactory, messenger) {
    dbg.log2('#ContactDetailsModalController  started');
    var vm = this;
    
    vm.errors = {};
    vm.updateUserData = updateUserData;
    vm.cancel = cancel;

    init();

    function init() {
      vm.progressbar = ngProgressFactory.createInstance();

      // update form on every modal opening. will reset after 'cancel'
      jQuery('#contactDetailsModal').on('show.bs.modal', function (event) {
        // get all data for current user
        user.getUserData().then(function (res) {     
          vm.userData = $.extend({}, res);
        });
        vm.userDetailsForm.$setPristine();
        vm.userDetailsForm.$setUntouched();
        vm.errors = {};

      });

    }

    function updateUserData(data, form) {
      vm.errors = {};
      user.updateUserData(data, form).then(function (res) {
        vm.updateBtn = 'Updated';
        form.$setPristine();
        form.$setUntouched();
        messenger.ok('Contact details updated successfully.');
      }, function(err) {
        vm.errors = err;
      });      
    }

    function cancel(){
      domServices.modal('contactDetailsModal', 'close');
    }


  }


})();
