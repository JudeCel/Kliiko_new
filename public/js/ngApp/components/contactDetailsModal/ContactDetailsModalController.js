(function () {
  'use strict';

  angular.module('KliikoApp').controller('ContactDetailsModalController', ContactDetailsModalController)

  ContactDetailsModalController.$inject = ['dbg', 'user', 'domServices', 'messenger', '$scope'];
  function ContactDetailsModalController(dbg, user, domServices, messenger, $scope) {
    dbg.log2('#ContactDetailsModalController started');

    var vm = this;
    var mobile = $('#mobile');
    var landlineNumber = $('#landlineNumber');

    vm.userData = {};
    vm.updateUserData = updateUserData;
    vm.cancel = cancel;

    mobile.on('countrychange', function(event, countryData) {
      if(vm.userData.phoneCountryData && countryData.iso2 != vm.userData.phoneCountryData.iso2) {
        vm.userDetailsForm.$setDirty();
        $scope.$apply();
      }
    });

    landlineNumber.on('countrychange', function(event, countryData) {
      if(vm.userData.landlineNumberCountryData && countryData.iso2 != vm.userData.landlineNumberCountryData.iso2) {
        vm.userDetailsForm.$setDirty();
        $scope.$apply();
      }
    });

    $('#contactDetailsModal').on('show.bs.modal', function (event) {
      vm.userDetailsForm.$setPristine();
      vm.userDetailsForm.$setUntouched();

      vm.errors = {};
      vm.userData = angular.copy(user.user);
      delete vm.userData.id;
      $scope.$apply();

      mobile.intlTelInput('setCountry', vm.userData.phoneCountryData.iso2);
      landlineNumber.intlTelInput('setCountry', vm.userData.landlineNumberCountryData.iso2);
    });

    function updateUserData() {
      setDependencies();

      user.updateUserData(vm.userData).then(function(res) {
        vm.updateBtn = 'Updated';
        vm.userDetailsForm.$setPristine();
        vm.userDetailsForm.$setUntouched();
        vm.errors = {};
        messenger.ok('Contact details updated successfully.');
      }, function(error) {
        vm.errors = error;
      });
    }

    function setDependencies() {
      vm.userData.phoneCountryData = mobile.intlTelInput('getSelectedCountryData');
      vm.userData.landlineNumberCountryData = landlineNumber.intlTelInput('getSelectedCountryData');

      vm.userData.mobile = mobile.val();
      vm.userData.landlineNumber = landlineNumber.val();
    }

    function cancel(){
      domServices.modal('contactDetailsModal', 'close');
    }
  }
})();
