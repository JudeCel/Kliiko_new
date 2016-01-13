(function () {
  'use strict';
  angular.module('KliikoApp').controller('ContactListController', ContactListController);
  ContactListController.$inject = ['$q', 'globalSettings', 'contactListServices', 'dbg', '$ocLazyLoad', '$injector'];
  function ContactListController($q, globalSettings, contactListServices, dbg, $ocLazyLoad, $injector) {
    var vm =  this;

    contactListServices.getContactLists().then(function(result) {
      vm.lists = result;
    })
  }
})();
