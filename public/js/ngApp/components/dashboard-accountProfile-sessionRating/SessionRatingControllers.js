(function () {
  'use strict';

  angular.module('KliikoApp').filter('findAccountUser', function(){
    return function(account, user) {
      for(var index in account.AccountUsers) {
        if(account.AccountUsers[index].UserId == user.id) {
          return index;
        }
      }
      return -1;
    }
  });

  angular.module('KliikoApp').controller('SessionRatingController', SessionRatingController);
  SessionRatingController.$inject = ['dbg', 'AccountDatabaseServices', '$modal', '$scope', '$rootScope', '$filter', 'angularConfirm', 'messenger'];

  function SessionRatingController(dbg, AccountDatabaseServices, $modal, $scope, $rootScope, $filter, angularConfirm, messenger) {
    dbg.log2('#SessionRatingController started');

    init();

    function init() {

    };
  };
})();
