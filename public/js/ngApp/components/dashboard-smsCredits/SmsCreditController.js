(function () {
  'use strict';

  angular.
    module('KliikoApp').
    controller('SmsCreditController', SmsCreditController);

  SmsCreditController.$inject = ['dbg', '$modal','$scope', 'SmsCreditService', 'domServices', 'messenger', 'globalSettings', 'ngProgressFactory'];

  function SmsCreditController(dbg, $modal, $scope, SmsCreditService, domServices, messenger, globalSettings, ngProgressFactory){
    dbg.log2('#SmsCreditController  started');
    var vm =  this;

    vm.creditList = [];
    vm.addonQty = [
      {value: 1, name: "1"},
      {value: 2, name: "2"},
      {value: 3, name: "3"},
      {value: 4, name: "4"},
      {value: 5, name: "5"},
      {value: 6, name: "6"},
      {value: 7, name: "7"},
      {value: 8, name: "8"},
      {value: 9, name: "9"},
      {value: 10, name: "10"}
    ];

    vm.priceInDollars = priceInDollars;
    vm.totalPrice = totalPrice;
    vm.purchaseCredits = purchaseCredits;

    init();

    function init() {
      SmsCreditService.getAllCreditPlans().then(function(result) {
        if(result.error){
          messenger.error(result.error);
        }else{
          vm.creditList = result.smsCreditList;
        }
      })
    }

    function purchaseCredits(addonId, qty) {



      SmsCreditService.puchaseCredits({
        addonId: addonId,
        addon_quantity: qty
      }).then(function(result) {
        if(result.error){
          messenger.error(result.error);
        }else{
          console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
          console.log(result);
          console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
        }

      })
    }

    function priceInDollars(priceInCents) {
      return priceInCents / 100;
    }

    function totalPrice(priceInCents, qty) {
      var totalPrice = null;
      if(!qty){
        return priceInDollars(priceInCents);
      }else{
        totalPrice = priceInCents * qty;
        return priceInDollars(totalPrice);
      }
    }

  }
})();
