(function () {
  'use strict';

  angular.module('KliikoApp').controller('AccountManagerController', AccountManagerController);
  AccountManagerController.$inject = ['dbg', 'domServices', '$state', '$stateParams', 'AccountManagerServices', '$scope', '$rootScope', 'user'];

  function AccountManagerController(dbg, domServices, $state, $stateParams, AccountManagerServices, $scope, $rootScope, user) {
    dbg.log2('#AccountManagerController started');
    var vm = this;

    vm.sendingData = false;
    vm.submitForm = submitForm;
    init();

    function init() {
      vm.user = {};
      AccountManagerServices.getAllManagersList().then(function(res) {
        vm.users = res.all;
        dbg.log2('#AccountManagerController > getAllManagersList > res ', res);
      });
    };

    function submitForm() {
      if(vm.sendingData) return;

      vm.sendingData = true
      dbg.log2('#AccountManagerController > submitForm', vm.user);
      AccountManagerServices.sendAccountManagerData(vm.user).then(function(res) {
        vm.sendingData = false;
        dbg.log2('#AccountManagerController > submitForm > post', res);
      });
    };
  };
})();
