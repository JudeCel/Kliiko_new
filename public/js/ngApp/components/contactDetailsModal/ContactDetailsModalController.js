(function () {
  'use strict';

  angular.
    module('KliikoApp').
    config(function(ipnConfig) {
      ipnConfig.autoPlaceholder = true;
      ipnConfig.customPlaceholder = function() {
        return "Recomended";
      };
      ipnConfig.preferredCountries = ['au'];
      return ipnConfig;
    });
  angular.
    module('KliikoApp').
    controller('ContactDetailsModalController', ContactDetailsModalController)

  ContactDetailsModalController.$inject = ['dbg', 'user','domServices', 'messenger'];
  function ContactDetailsModalController(dbg,  user, domServices, messenger) {
    dbg.log2('#ContactDetailsModalController  started');
    var vm = this;
    vm.userData = {};
    vm.resetUserData = {};
    init();

    vm.errors = {};
    vm.updateUserData = updateUserData;
    vm.cancel = cancel;
    vm.validatePhone = validatePhone;
    vm.initUser = initUser;

    vm.phoneCountryData = sessionStorage.getItem('phoneCountryData') || 'au';
    vm.landlineNumberCountryData = sessionStorage.getItem('landlineNumberCountryData') || 'au';

    vm.phoneDialCode = null;
    vm.phoneCountryName = null;
    vm.phoneIso2 = null;

    vm.landlineNumberDialCode = null;
    vm.landlineNumberCountryName = null;
    vm.landlineNumberIso2 = null;

    function init() {
      // update form on every modal opening. will reset after 'cancel'
      jQuery('#contactDetailsModal').on('show.bs.modal', function (event) {
        vm.userDetailsForm.$setPristine();
        vm.userDetailsForm.$setUntouched();
        vm.errors = {};
      });
    }

    function initUser(user) {
      angular.copy(user, vm.resetUserData);
      angular.copy(user, vm.userData);
      phoneCountrySelected(vm.userData);
      landlineNumberCountrySelected(vm.userData);
    }

    function getPhoneCountryData() {
      vm.phoneDialCode = $("#mobile").intlTelInput("getSelectedCountryData").dialCode;
      vm.phoneCountryName = $("#mobile").intlTelInput("getSelectedCountryData").name;
      vm.phoneIso2 = $("#mobile").intlTelInput("getSelectedCountryData").iso2;
    }

    function getLandlineNumberCountryData() {
      vm.landlineNumberDialCode = $("#landlineNumber").intlTelInput("getSelectedCountryData").dialCode;
      vm.landlineNumberCountryName = $("#landlineNumber").intlTelInput("getSelectedCountryData").name;
      vm.landlineNumberIso2 = $("#landlineNumber").intlTelInput("getSelectedCountryData").iso2;
    }


    function phoneCountrySelected(user) {
      sessionStorage.setItem('phoneCountryData', user.phoneCountryData.iso2);
      return vm.phoneCountryData = sessionStorage.getItem('phoneCountryData')
    }

    function landlineNumberCountrySelected(user) {
      sessionStorage.setItem('landlineNumberCountryData', user.landlineNumberCountryData.iso2);
      return vm.landlineNumberCountryData = sessionStorage.getItem('landlineNumberCountryData')
    }


    function updateUserData(data, form) {
      data.mobile = $("#mobile").val();
      data.landlineNumber = $("#landlineNumber").val();
      if(validatePhoneNumber(data.mobile) && validateLandlineNumber(data.landlineNumber)){
        getPhoneCountryData();
        getLandlineNumberCountryData();

        var phoneCountryData = {
          iso2: vm.phoneIso2,
          dialCode: vm.phoneDialCode,
          countryName: vm.phoneCountryName
        }

        var landlineNumberCountryData = {
          iso2: vm.landlineNumberIso2,
          dialCode: vm.landlineNumberDialCode,
          countryName: vm.landlineNumberCountryName
        }

        data.phoneCountryData = phoneCountryData;
        data.landlineNumberCountryData = landlineNumberCountryData;
        // countrySelected(data);

        vm.errors = {};
        delete data.id;
        user.updateUserData(data, form).then(function (res) {
          angular.copy(res, vm.userData);
          angular.copy(res, vm.resetUserData);
          vm.updateBtn = 'Updated';
          form.$setPristine();
          form.$setUntouched();
          messenger.ok('Contact details updated successfully.');
        }, function(err) {
          vm.errors = err;
        });
      }
    }

    function validatePhoneNumber(mobile) {
      if(mobile === undefined && !validatePhone()){
        messenger.error("The mobile number for this country is not valid.");
        return false;
      }
      return true;
    }

    function validateLandlineNumber(landlineNumber) {
      if(landlineNumber === undefined && !validLandlineNumber()){
        messenger.error("The landline number for this country is not valid.");
        return false;
      }
      return true;
    }

    function validatePhone() {
      return $("#mobile").intlTelInput("isValidNumber");
    }

    function validLandlineNumber() {
      return $("#landlineNumber").intlTelInput("isValidNumber");
    }

    function cancel(){
      angular.copy(vm.resetUserData, vm.userData);
      vm.errors = {};
      domServices.modal('contactDetailsModal', 'close');
    }

  }


})();
