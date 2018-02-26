(function () {
  'use strict';

  angular.
    module('KliikoApp').
    controller('SmsCreditController', SmsCreditController);

  SmsCreditController.$inject = ['dbg', '$modal','$scope', 'SmsCreditService', 'domServices', 'messenger'];

  function SmsCreditController(dbg, $modal, $scope, SmsCreditService, domServices, messenger){
    dbg.log2('#SmsCreditController  started');
    var vm =  this;

    vm.currentSmsCreditCount = 0;
    vm.checkoutButtonDisabled = false;
    vm.creditList = [];
    vm.addonQty = [
      { value: 1 },
      { value: 2 },
      { value: 3 },
      { value: 4 },
      { value: 5 },
      { value: 6 },
      { value: 7 },
      { value: 8 },
      { value: 9 },
      { value: 10 }
    ];

    vm.priceInDollars = priceInDollars;
    vm.totalPrice = totalPrice;
    vm.purchaseCredits = purchaseCredits;
    vm.checkout = checkout;
    init();

    function init() {
      getCurrentSmsCreditCount();
      getAddonList();
    }

    function getAddonList() {
      SmsCreditService.getAllCreditPlans().then(function(result) {
        if(result.error){
          messenger.error(result.error);
        }else{
          vm.creditList = result.smsCreditList;
        }
      })
    }

    function getCurrentSmsCreditCount() {
      SmsCreditService.creditCount().then(function(result) {
        if(result.error){
          messenger.error(result.error);
        }else{
          vm.currentSmsCreditCount = result.creditCount;
        }
      })
    }
    function checkout(id, selectedQty, permission) {
      if(!selectedQty) {
        return messenger.error('Quantity not selected');
      }
      if(!permission) {
        return domServices.modal('smsCreditsModal');
      }
      vm.checkoutButtonDisabled = false;

      SmsCreditService.checkout().then(function(result){
        ChargeBee.bootStrapModal(result.hosted_page.url, result.hosted_page.site_name, "paymentModal").load({
          onLoad: function() {
            vm.checkoutButtonDisabled = true;
          },
          onSuccess: function(a, b) {
            vm.checkoutButtonDisabled = false;
            return purchaseCredits(id, selectedQty);
          },
          onCancel: function() {
            $(".alert-danger").show().text("Payment Aborted !!");
            vm.checkoutButtonDisabled = false;
          }
        });
      });
    }

    function purchaseCredits(addonId, qty) {
      SmsCreditService.puchaseCredits({
        addonId: addonId,
        addon_quantity: qty
      }).then(function(result) {
        if(result.error){
          if(result.error.planTooLow) {
            domServices.modal('smsCreditsModal');
          }
          else {
            messenger.error(result.error);
          }
        }else{
          vm.currentSmsCreditCount = result.smsCretiCount;
          messenger.ok(result.message);
        }
      })
    }

    function priceInDollars(priceInCents) {
      return priceInCents / 100;
    }

    function totalPrice(priceInCents, qty) {
      if(!qty){
        return priceInDollars(0);
      }else{
        return priceInDollars(priceInCents * qty);
      }
    }

  }
})();
