(function () {
  'use strict';

  angular.module('KliikoApp').filter('findPositionById', function(){
    return function(element, array) {
      for(var index in array) {
        if(array[index].id == element.id) {
          return index;
        }
      }
      return -1;
    }
  });

  angular.module('KliikoApp').controller('AccountManagerController', AccountManagerController);
  AccountManagerController.$inject = ['dbg', 'accountManagerServices', '$modal', '$scope', '$rootScope', '$filter', '$timeout', 'angularConfirm', 'messenger'];

  function AccountManagerController(dbg, accountManagerServices, $modal, $scope, $rootScope, $filter, $timeout, angularConfirm, messenger) {
    dbg.log2('#AccountManagerController started');

    $scope.accountUsers = {};
    init();

    function init() {
      accountManagerServices.getAllManagersList().then(function(res) {
        $scope.accountUsers = res.accountUsers;
        dbg.log2('#AccountManagerController > getAllManagersList > res ', res.accountUsers);
      });
    };

    $scope.openModal = function() {
      $scope.modalInstance = $modal.open({
        templateUrl: 'js/ngApp/components/dashboard-accountProfile-accountManagers/modal.html',
        windowTemplateUrl: 'js/ngApp/components/dashboard-accountProfile-accountManagers/window.html',
        controller: AccountManagerModalController
      });
    };

    $scope.removeAccountUser = function(accountUser) {
      angularConfirm('Are you sure you want to remove Account Manager?').then(function(response) {
        accountManagerServices.removeAccountUser({ id: accountUser.id }).then(function(res) {
          dbg.log2('#AccountManagerController > removeAccountUser > res ', res);
          if(res.error) {
            setError($scope, res.error);
          }
          else {
            setMessage($scope, res.message);
            var index = $scope.accountUsers.indexOf(accountUser);
            $scope.accountUsers.splice(index, 1);
          }
        });
      });
    };

    $scope.isInvited = function(accountUser) {
      return accountUser.status == "invited";
    };

    $scope.isAccepted = function(accountUser) {
      return accountUser.status == "active";
    };

    $scope.isAccountOwner = function(accountUser) {
      return accountUser.owner;
    };

    $scope.removeInvite = function(accountUser) {
      angularConfirm('Are you sure you want to remove Invite?').then(function(response) {
        accountManagerServices.removeInvite({ id: accountUser.id }).then(function(res) {
          dbg.log2('#AccountManagerController > removeInvite > res ', res);
          if(res.error) {
            setError($scope, res.error);
          }
          else {
            setMessage($scope, res.message);
            var index = $scope.accountUsers.indexOf(accountUser);
            $scope.accountUsers.splice(index, 1);
            messenger.ok(res.message)
          }
        });
      });
    };

    function setMessage(scope, message) {
      if(message) {
        scope.error = null;
      }

      scope.message = message;
    };

    function setError(scope, error) {
      if(error) {
        scope.message = null;
      }

      scope.error = error;
    };

    $rootScope.$watch('addedNewAccountManager', function(data) {
      if($rootScope.addedNewAccountManager) {
        if($filter('findPositionById')(data.accountUser, $scope.accountUsers) == -1) {
          $scope.accountUsers.push(data.accountUser);
        }

        setMessage($scope, data.message);
        $rootScope.addedNewAccountManager = null;
      }
    });

    $scope.$watch('message', function(data) {
      if($scope.message) {
        $timeout(function() {
          setMessage($scope, null);
        }, 2000);
      }
    });

    $scope.$watch('error', function(data) {
      if($scope.error) {
        $timeout(function() {
          setError($scope, null);
        }, 2000);
      }
    });
  };

  angular.module('KliikoApp').controller('AccountManagerModalController', AccountManagerModalController);
  AccountManagerModalController.$inject = ['dbg', '$scope', '$uibModalInstance', 'accountManagerServices', '$rootScope', 'ngProgressFactory'];

  function AccountManagerModalController(dbg, $scope, $uibModalInstance, accountManagerServices, $rootScope, ngProgressFactory) {
    dbg.log2('#AccountManagerModalController started');

    $scope.accountUser = {};
    $scope.errors = {};
    $scope.sendingData = false;

    $scope.submitForm = function() {
      if($scope.sendingData) return;

      $scope.sendingData = true;
      var progressbar = ngProgressFactory.createInstance();
      progressbar.start();
      dbg.log2('#AccountManagerModalController > submitForm', $scope.accountUser);
      accountManagerServices.createAccountManager($scope.accountUser).then(function(res) {
        $scope.sendingData = false;
        progressbar.complete();
        if(res.error) {
          $scope.errors = res.error;
        }
        else {
          var accountUser = res.invite.AccountUser;
          $rootScope.addedNewAccountManager = { accountUser: accountUser, message: res.message };
          $uibModalInstance.dismiss('cancel');
        }
      });
    };

    $scope.closeModal = function() {
      $scope.accountUser = {};
      $scope.errors = {};
      $uibModalInstance.dismiss('cancel');
    };
  }
})();
