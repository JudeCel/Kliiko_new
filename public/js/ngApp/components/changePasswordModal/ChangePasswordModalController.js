(function () {
  'use strict';

  angular.
    module('KliikoApp').
    controller('ChangePasswordModalController', ChangePasswordModalController);

  ChangePasswordModalController.$inject = ['dbg', 'user','domServices', 'ngProgressFactory', 'messenger'];
  function ChangePasswordModalController(dbg,  user, domServices, ngProgressFactory, messenger) {
    dbg.log2('#ChangePasswordModalController  started');
    var vm = this;

    vm.changePasswordData = changePasswordData;
    vm.cancel = cancel;

    function changePasswordData(data, form) {
      user.changeUserPassword(data, form).then(function (res) {
        if(res.error){
          messenger.error(res.error);
        }else{
          messenger.ok(res.message);
          form.$setPristine();
          form.$setUntouched();
        }
      });
    }

    function cancel(){
      domServices.modal('changePasswordModal', 'close');
    }
  }

})();
