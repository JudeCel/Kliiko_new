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
  AccountDatabaseController.$inject = ['dbg', 'AccountDatabaseServices', '$scope', '$filter', 'messenger', 'domServices'];

  function AccountDatabaseController(dbg, AccountDatabaseServices, $scope, $filter, messenger, domServices) {
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

    $scope.editComment = function(accountUser) {
      $scope.currentAccountUser = accountUser;
      domServices.modal('accountDatabaseCommentModal');
    };

    $scope.closeModal = function() {
      domServices.modal('accountDatabaseCommentModal', 1);
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

    $scope.updateComment = function() {
      $scope.sendingData = true;

      AccountDatabaseServices.updateAccountUserComment({ id: $scope.currentAccountUser.id, comment: $scope.currentAccountUser.comment }).then(function(res) {
        $scope.sendingData = false;

        if(res.error) {
          messenger.error(res.error);
        }
        else {
          var index = $filter('findPositionById')(res.account, $scope.accounts);
          if(index > -1) {
            $scope.accounts.splice(index, 1, res.account);
          }

          messenger.ok(res.message);
        }
      });
    };

    $scope.planToUpperCase = function( plan ) {
      if (plan) {
        return plan.split('_').map( function(v) { return v } ).join( ' ' );
      } else {
        return "";
      }
    }
  };
})();
