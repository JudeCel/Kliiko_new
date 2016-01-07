(function () {
  'use strict';

  angular.
    module('KliikoApp').
    controller('ChangePasswordModalController', ChangePasswordModalController);

  ChangePasswordModalController.$inject = ['dbg', 'user','domServices', 'ngProgressFactory', 'messenger'];
  function ChangePasswordModalController(dbg,  user, domServices, ngProgressFactory, messenger) {
    dbg.log2('#ChangePasswordModalController  started');
    var vm = this;

    vm.passwordData = {};
    vm.changePasswordData = changePasswordData;
    vm.cancel = cancel;

    function changePasswordData(data, form) {
      user.changeUserPassword(data, form).then(function (res) {
        vm.passwordData = {};
        if(res.error){
          messenger.error(res.error);
        }else{
          cancel();
          messenger.ok(res.message);
        }
      });
    }

    function cancel(){
      domServices.modal('changePasswordModal', 'close');
    }
  }

})();
