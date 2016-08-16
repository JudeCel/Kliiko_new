(function () {
  'use strict';

  angular.module('KliikoApp').controller('ChangePasswordModalController', ChangePasswordModalController);
  angular.module('KliikoApp.Root').controller('ChangePasswordModalController', ChangePasswordModalController);

  ChangePasswordModalController.$inject = ['dbg', 'user','domServices', 'messenger'];
  function ChangePasswordModalController(dbg,  user, domServices, messenger) {
    dbg.log2('#ChangePasswordModalController  started');
    var vm = this;

    vm.passwordData = {};
    vm.changePasswordData = changePasswordData;
    vm.cancel = cancel;

    function changePasswordData(data, form) {
      user.changeUserPassword(data, form).then(function (res) {
        vm.passwordData = {};
        messenger.ok(res.message);
        cancel()
      }, function(error) {
        messenger.error(error);
      });
    }

    function cancel(){
      domServices.modal('changePasswordModal', 'close');
    }

    function prepareError(err){
      if(err.includes("Validation error:")){
        return err.replace("Validation error: ","")
      }else{
        return err
      }
    }
  }

})();
