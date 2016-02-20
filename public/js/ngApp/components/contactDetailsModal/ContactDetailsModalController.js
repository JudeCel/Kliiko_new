(function () {
  'use strict';

  angular.
    module('KliikoApp').
    controller('ContactDetailsModalController', ContactDetailsModalController);

  ContactDetailsModalController.$inject = ['dbg', 'user','domServices', 'ngProgressFactory', 'messenger', '$sce'];
  function ContactDetailsModalController(dbg,  user, domServices, ngProgressFactory, messenger, $sce) {
    dbg.log2('#ContactDetailsModalController  started');
    var vm = this;
    init();

    vm.errors = {};
    vm.updateUserData = updateUserData;
    vm.cancel = cancel;

    vm.validatePhone = validatePhone;

    vm.countryIso = sessionStorage.getItem('countryIso2')
    vm.dialCode = null;
    vm.countryName = null;
    vm.iso2 = null;

    function init() {
      vm.progressbar = ngProgressFactory.createInstance();

      // update form on every modal opening. will reset after 'cancel'
      jQuery('#contactDetailsModal').on('show.bs.modal', function (event) {
        // get all data for current user
        user.getUserData().then(function (res) {
          vm.userData = $.extend({}, res);
          countrySelected(res);
        });
        vm.userDetailsForm.$setPristine();
        vm.userDetailsForm.$setUntouched();
        vm.errors = {};
        console.log(vm.userDetailsForm)

      });
    }

    function getCountryData() {
      vm.dialCode = $("#mobile").intlTelInput("getSelectedCountryData").dialCode;
      vm.countryName = $("#mobile").intlTelInput("getSelectedCountryData").name;
      vm.iso2 = $("#mobile").intlTelInput("getSelectedCountryData").iso2;
    }

    function countrySelected(user) {
      if(user.phoneCountryData.iso2 !== sessionStorage.getItem('countryIso2')){
        sessionStorage.setItem('countryIso2', user.phoneCountryData.iso2);
      }

      return vm.countryIso = sessionStorage.getItem('countryIso2')
    }

    function validatePhone() {
      return $("#mobile").intlTelInput("isValidNumber");
    }

    function updateUserData(data, form) {
      if(!validatePhone()){
        messenger.error("The phone number for this country is not valid.");
      }else {
        getCountryData();

        var countryData = {
          iso2: vm.iso2,
          dialCode: vm.dialCode,
          countryName: vm.countryName
        }

        data.phoneCountryData = countryData;
        countrySelected(data);

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

    function cancel(){
      domServices.modal('contactDetailsModal', 'close');
    }


  }


})();
