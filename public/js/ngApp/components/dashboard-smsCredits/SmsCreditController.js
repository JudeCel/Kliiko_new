(function () {
  'use strict';

  angular.
    module('KliikoApp').
    controller('SmsCreditController', SmsCreditController);

  SmsCreditController.$inject = ['dbg', '$modal','$scope', 'SmsCreditService', 'domServices', 'messenger', 'globalSettings', 'ngProgressFactory'];

  function SmsCreditController(dbg, $modal, $scope, SmsCreditService, domServices, messenger, globalSettings, ngProgressFactory){
    dbg.log2('#SmsCreditController  started');
    var vm =  this;

    vm.smsCreditList = [];

    init();

    function init() {
      SmsCreditService.getList().then(function(result) {
        if(result.error){
          messenger.error(result.error);
        }else{
          smsCreditList = result.smsCreditList;
        }
      })
    }

  }
})();
