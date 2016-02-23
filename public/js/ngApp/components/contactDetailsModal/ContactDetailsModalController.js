(function () {
  'use strict';

  angular.
    module('KliikoApp').
    controller('ContactDetailsModalController', ContactDetailsModalController);

  ContactDetailsModalController.$inject = ['dbg', 'user','domServices', 'ngProgressFactory', 'messenger'];
  function ContactDetailsModalController(dbg,  user, domServices, ngProgressFactory, messenger) {
    dbg.log2('#ContactDetailsModalController  started');
    var vm = this;
    init();

    vm.errors = {};
    vm.updateUserData = updateUserData;
    vm.cancel = cancel;

    vm.validatePhone = validatePhone;

    vm.phoneCountryData = sessionStorage.getItem('phoneCountryData') || 'au';
    vm.landlineNumberCountryData = sessionStorage.getItem('landlineNumberCountryData') || 'au';

    vm.phoneDialCode = null;
    vm.phoneCountryName = null;
    vm.phoneIso2 = null;

    vm.landlineNumberDialCode = null;
    vm.landlineNumberCountryName = null;
    vm.landlineNumberIso2 = null;

    function init() {
      vm.progressbar = ngProgressFactory.createInstance();

      // update form on every modal opening. will reset after 'cancel'
      jQuery('#contactDetailsModal').on('show.bs.modal', function (event) {
        // get all data for current user
        user.getUserData().then(function (res) {
          vm.userData = $.extend({}, res);
        });
        vm.userDetailsForm.$setPristine();
        vm.userDetailsForm.$setUntouched();
        vm.errors = {};
      });
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
      sessionStorage.setItem('landlineNumberCountryData', user.phoneCountryData.iso2);
      return vm.landlineNumberCountryData = sessionStorage.getItem('landlineNumberCountryData')
    }

    function validatePhone() {
      return $("#mobile").intlTelInput("isValidNumber");
    }

    function validateLandlineNumber() {
      return $("#landlineNumber").intlTelInput("isValidNumber");
    }

    function updateUserData(data, form) {
      if(validateNumbers()){
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
        user.updateUserData(data, form).then(function (res) {
          vm.updateBtn = 'Updated';
          form.$setPristine();
          form.$setUntouched();
          messenger.ok('Contact details updated successfully.');
        }, function(err) {
          vm.errors = err;
        });
      }
    }

    function validateNumbers() {
      if(!validatePhone()){
        messenger.error("The mobile number for this country is not valid.");
        return false;
      }
      if(!validateLandlineNumber()){
        messenger.error("The landline number for this country is not valid.");
        return false;
      }
      return true;
    }

    function cancel(){
      domServices.modal('contactDetailsModal', 'close');
    }


  }


})();
