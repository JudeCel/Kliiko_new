(function () {
  'use strict';

  angular.module('KliikoApp').controller('PhoneNumberController', PhoneNumberController);
  angular.module('KliikoApp.Root').controller('PhoneNumberController', PhoneNumberController);

  PhoneNumberController.$inject = ['dbg', '$scope', '$q', '$rootScope'];
  function PhoneNumberController(dbg, $scope, $q, $rootScope) {
    dbg.log2('#PhoneNumberController started');

    var vm = this;
    vm.defaultCountry = 'au';
    vm.init = init;

    $scope.$watch(function() {
      return watchNumber(vm.mobileController);
    }, function(next, prev) {
      setNumberAndData(next, prev, vm.mobileController, 'mobile');
    });

    $scope.$watch(function() {
      return watchNumber(vm.landlineController);
    }, function(next, prev) {
      setNumberAndData(next, prev, vm.landlineController, 'landline');
    });

    function init(userInfo, modalName) {
      vm.userInfo = userInfo || {};

      if(modalName) {
        vm.modalName = modalName;
      }
      else {
        setDefaults();
      }
    };

    function watchNumber(controller) {
      if(controller) {
        return controller.getNumber();
      }
      else {
        return false;
      }
    }

    function setNumberAndData(next, prev, controller, type) {
      if(next != prev && controller) {
        var phone;

        if(type == 'mobile') {
          phone = controller.getNumber();
          if(phone) {
            vm.userInfo.mobile = phone;
            vm.userInfo.mobileController = controller;
            vm.userInfo.phoneCountryData = controller.getSelectedCountryData();
          }
        }
        else if(type == 'landline') {
          phone = controller.getNumber();
          if(phone) {
            vm.userInfo.landlineNumber = phone;
            vm.userInfo.landlineController = controller;
            vm.userInfo.landlineNumberCountryData = controller.getSelectedCountryData();
          }
        }
      }
    }

    function setDefaults() {
      var country;
      if(vm.mobileController) {
        if(vm.userInfo.phoneCountryData) {
          country = vm.userInfo.phoneCountryData.iso2 || vm.defaultCountry;
        }
        else {
          country = vm.defaultCountry;
        }
        vm.mobileController.setCountry(country);
      }

      if(vm.landlineController) {
        if(vm.userInfo.landlineNumberCountryData) {
          country = vm.userInfo.landlineNumberCountryData.iso2 || vm.defaultCountry;
        }
        else {
          country = vm.defaultCountry;
        }

        vm.landlineController.setCountry(country);
      }
    }
  }
})();
