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
  AccountManagerController.$inject = ['dbg', 'AccountManagerServices', '$modal', '$scope', '$rootScope', '$filter', '$timeout'];

  function AccountManagerController(dbg, AccountManagerServices, $modal, $scope, $rootScope, $filter, $timeout) {
    dbg.log2('#AccountManagerController started');

    $scope.users = {};
    init();

    function init() {
      AccountManagerServices.getAllManagersList().then(function(res) {
        $scope.users = res.users;
        dbg.log2('#AccountManagerController > getAllManagersList > res ', res.users);
      });
    };

    $scope.openModal = function() {
      $scope.modalInstance = $modal.open({
        templateUrl: 'js/ngApp/components/dashboard-accountProfile-accountManagers/modal.html',
        windowTemplateUrl: 'js/ngApp/components/dashboard-accountProfile-accountManagers/window.html',
        controller: AccountManagerModalController
      });
    };

    $scope.removeAccountOrInvite = function(type, user) {
      AccountManagerServices.removeAccountManager({ type: type, id: user.id }).then(function(res) {
        dbg.log2('#AccountManagerController > removeAccountOrInvite > res ', res);
        if(res.error) {
          setError($scope, res.error);
        }
        else {
          setMessage($scope, res.message);
          var index = $scope.users.indexOf(user);
          $scope.users.splice(index, 1);
        }
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
        if($filter('findPositionById')(data.user, $scope.users) == -1) {
          $scope.users.push(data.user);
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
  AccountManagerModalController.$inject = ['dbg', '$scope', '$uibModalInstance', 'AccountManagerServices', '$rootScope'];

  function AccountManagerModalController(dbg, $scope, $uibModalInstance, AccountManagerServices, $rootScope) {
    dbg.log2('#AccountManagerModalController started');

    $scope.user = {};
    $scope.errors = {};
    $scope.sendingData = false;

    $scope.submitForm = function() {
      if($scope.sendingData) return;

      $scope.sendingData = true;
      dbg.log2('#AccountManagerModalController > submitForm', $scope.user);
      AccountManagerServices.createAccountManager($scope.user).then(function(res) {
        $scope.sendingData = false;
        if(res.error) {
          $scope.errors = res.error;
        }
        else {
          var user = res.invite.User;
          user.Invites = [res.invite];
          $rootScope.addedNewAccountManager = { user: user, message: res.message };
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
