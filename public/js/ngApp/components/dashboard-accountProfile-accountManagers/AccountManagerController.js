(function () {
  'use strict';

  angular.module('KliikoApp').controller('AccountManagerController', AccountManagerController);

  AccountManagerController.$inject = ['dbg', 'messenger', 'accountManagerServices', 'angularConfirm', '$window', '$rootScope', 'domServices', '$scope'];
  function AccountManagerController(dbg, messenger, accountManagerServices, angularConfirm, $window, $rootScope, domServices, $scope){
    dbg.log2('#AccountManagerController started');
    var vm = this;
    vm.maxLength = { normal: 20, email: 40 };

    init();
    vm.openModal = openModal;
    vm.removeAccountUser = removeAccountUser;
    vm.isInvited = isInvited;
    vm.isAccepted = isAccepted;
    vm.isAccountOwner = isAccountOwner;
    vm.removeInvite = removeInvite;
    vm.submitForm = submitForm;
    vm.cancel = cancel;

    vm.modalInstance = null;
    vm.editModalInstance = null;
    vm.formAction = null;

    vm.accountUsers = [];
    vm.accountUser = {};

    vm.saveButtonText = "";
    vm.modalTitle = "";
    vm.createNewModalTitle = "Add New Account Manager";
    vm.editModalTitle = "Edit Account Manager";
    vm.modalPath = "/js/ngApp/components/dashboard-accountProfile-accountManagers/modal.html";

    function init() {
      accountManagerServices.getAllManagersList().then(function(res) {
        if(res.error){
          messenger.error(res.error)
        }else{
          vm.accountUsers = res.accountUsers;
        }
      });
    };

    function openModal(modalTitle, action, accountUser) {
      vm.userIndex = vm.accountUsers.indexOf(accountUser);
      angular.copy(accountUser, vm.accountUser)

      vm.modalTitle = modalTitle;
      vm.formAction = action;

      setSaveButtonText(vm.formAction);
      domServices.modal('accountManagerModal');
    }

    function setSaveButtonText(action) {
      if(edditing(action)) {
        vm.saveButtonText = "Update";
      }else{
        vm.saveButtonText = "Invite";
      }
    }

    function removeAccountUser(accountUser) {
      angularConfirm('Are you sure you want to remove Account Manager?').then(function(response) {
        accountManagerServices.removeAccountUser({ id: accountUser.id }).then(function(res) {
          dbg.log2('#AccountManagerController > removeAccountUser > res ', res);
          if(res.error) {
            messenger.error(res.error);
          }
          else {
            var index = vm.accountUsers.indexOf(accountUser);
            vm.accountUsers.splice(index, 1);
          }
        });
      });
    };

    function isInvited(accountUser) {
      return accountUser.status == "invited";
    };

    function isAccepted(accountUser) {
      return accountUser.status == "active";
    };

    function isAccountOwner(accountUser) {
      return accountUser.owner;
    };

    function removeInvite(accountUser) {
      angularConfirm('Are you sure you want to remove Invite?').then(function(response) {
        accountManagerServices.removeInvite({ id: accountUser.id }).then(function(res) {
          dbg.log2('#AccountManagerController > removeInvite > res ', res);
          if(res.error) {
            messenger.error(res.error)
          }else {
            var index = vm.accountUsers.indexOf(accountUser);
            vm.accountUsers.splice(index, 1);
            messenger.ok(res.message)
          }
        });
      });
    };

    function submitForm(action, data) {
      if(edditing(action)) {
        editAccountManager(data);
      }else{
        createNewAccountManager(data);
      }
    }

    function createNewAccountManager(data) {
      accountManagerServices.createAccountManager(data).then(function(result) {
        if(result.error) {
          messenger.error(result.error);
        }else{
          onSuccess(result.message)
          vm.accountUsers.push(result.invite.AccountUser);
        }
      })
    }

    function editAccountManager(data) {
      accountManagerServices.editAccountManager(data).then(function(result) {
        if(result.error) {
          messenger.error(result.error);
        }else{
          vm.accountUsers[vm.userIndex] = result.accountManager;
          onSuccess(result.message);
        }
      })
    }

    function onSuccess(message) {
      domServices.modal('accountManagerModal', 'close');
      vm.accountUser = {};
      messenger.ok(message);
    }

    function edditing(action) {
      return action == 'edit';
    }

    function cancel() {
      domServices.modal('accountManagerModal', 'close');
    }
  }
})();
