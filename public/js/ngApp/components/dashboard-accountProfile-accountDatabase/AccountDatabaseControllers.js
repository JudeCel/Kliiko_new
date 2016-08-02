(function () {
  'use strict';

  angular.module('KliikoApp').filter('findAccountUser', function(){
    return function(account, user) {
      for(var index in account.AccountUsers) {
        if(account.AccountUsers[index] && account.AccountUsers[index].UserId == user.UserId) {
          return index;
        }
      }
      return -1;
    }
  });

  angular.module('KliikoApp').filter('findPositionById', function() {
    return function(account, accountList) {
      for(var index in accountList) {
        if(account.id == accountList[index].id) {
          return index;
        }
      }
      return -1;
    }
  });

  angular.module('KliikoApp').controller('AccountDatabaseController', AccountDatabaseController);
  AccountDatabaseController.$inject = ['dbg', 'AccountDatabaseServices', '$modal', '$scope', '$rootScope', '$filter', 'angularConfirm', 'messenger'];

  function AccountDatabaseController(dbg, AccountDatabaseServices, $modal, $scope, $rootScope, $filter, angularConfirm, messenger) {
    dbg.log2('#AccountDatabaseController started');

    $scope.accounts = {};
    init();

    function init() {
      AccountDatabaseServices.getAccountDatabases().then(function(res) {
        $scope.accounts = res.accounts;
        $scope.dateFormat = res.dateFormat;
        dbg.log2('#AccountDatabaseController > getAccountDatabases > res ', res.accounts);
      });
    };

    $scope.editComment = function(account, user) {
      $scope.modalInstance = $modal.open({
        templateUrl: '/js/ngApp/components/dashboard-accountProfile-accountDatabase/modal.html',
        windowTemplateUrl: '/js/ngApp/components/dashboard-accountProfile-accountDatabase/window.html',
        controller: AccountDatabaseModalController,
        resolve: {
          data: function() {
            return { userId: user.UserId, accountId: account.id, comment: $scope.findRightAccountUser(account, user).comment };
          }
        }
      });
    };

    $scope.changeAccountStatus = function(account, user) {
      if($scope.changeAccountStatusSending) return;

      $scope.changeAccountStatusSending = true;
      var accountUser = $scope.findRightAccountUser(account, user);
      var params = { accountId: account.id, userId: user.UserId, active: !accountUser.active };
      dbg.log2('#AccountDatabaseController > changeAccountStatus', params);

      AccountDatabaseServices.updateAccountUser(params).then(function(res) {
        $scope.changeAccountStatusSending = false;
        if(res.error) {
          messenger.error(res.error);
        }
        else {
          var index = $filter('findPositionById')(res.account, $scope.accounts);
          if(index > -1) {
            $scope.accounts.splice(index, 1, res.account);
          }
          var message = 'Account has been ' + (accountUser.active ? 'deactivated' : 'activated');
          messenger.ok(message);
        }
      });
    };

    $scope.findRightAccountUser = function(account, user) {
      var index = $filter('findAccountUser')(account, user);
      if(index > -1) {
        return account.AccountUsers[index];
      }
      else {
        return {}
      }
    };

    $scope.chooseIconForUser = function(account, user) {
      var accountUser = $scope.findRightAccountUser(account, user);
      if(accountUser.active) {
        return '/icons/ic_tick.png';
      }
      else {
        return '/icons/ic_cross.png';
      }
    };

    $rootScope.$watch('changedUserComment', function(data) {
      if($rootScope.changedUserComment) {
        var index = $filter('findPositionById')(data.account, $scope.accounts);
        if(index > -1) {
          $scope.accounts.splice(index, 1, data.account);
        }

        messenger.ok(data.message);
        $rootScope.changedUserComment = null;
      }
    });

    $scope.planToUpperCase = function( plan ) {
      if (plan) {
        return plan.split('_').map( function(v) { return v } ).join( ' ' );
      } else {
        return "";
      }
    }
  };

  angular.module('KliikoApp').controller('AccountDatabaseModalController', AccountDatabaseModalController);
  AccountDatabaseModalController.$inject = ['dbg', '$scope', '$uibModalInstance', 'AccountDatabaseServices', '$rootScope', 'data'];

  function AccountDatabaseModalController(dbg, $scope, $uibModalInstance, AccountDatabaseServices, $rootScope, data) {
    dbg.log2('#AccountDatabaseModalController started');

    $scope.user = {};
    $scope.errors = {};
    $scope.comment = data.comment;
    $scope.userId = data.userId;
    $scope.accountId = data.accountId;

    $scope.sendingData = false;

    $scope.submitForm = function() {
      if($scope.sendingData) return;

      var params = { accountId: $scope.accountId, userId: $scope.userId, comment: $scope.comment };
      $scope.sendingData = true;
      dbg.log2('#AccountDatabaseModalController > submitForm', params);

      AccountDatabaseServices.updateAccountUser(params).then(function(res) {
        $scope.sendingData = false;
        if(res.error) {
          $scope.errors = res.error;
        }
        else {
          $rootScope.changedUserComment = { account: res.account, message: res.message };
          $uibModalInstance.dismiss('cancel');
        }
      });
    };

    $scope.closeModal = function() {
      $scope.user = {};
      $scope.errors = {};
      $uibModalInstance.dismiss('cancel');
    };

  };
})();
