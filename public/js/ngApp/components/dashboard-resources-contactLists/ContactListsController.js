(function () {
  'use strict';
  angular.module('KliikoApp').controller('ContactListController', ContactListController);

  ContactListController.$inject = ['domServices','contactListServices', 'dbg'];
  function ContactListController(domServices, contactListServices, dbg) {
    dbg.log2('#ContactListController  started');
    var vm =  this;

    vm.lists = [];
    vm.activeListIndex = null;
    vm.newContact = {};

    vm.listItemClickHandle = listItemClickHandle;
    vm.addContactManual = addContactManual;
    vm.createContact = createContact;

    init();

    function init() {
      contactListServices.getContactLists().then(function (result) {
        vm.lists = result;

        if (vm.lists.length) vm.activeListIndex = 0;
      });
    }

    function listItemClickHandle(item, index){
      vm.activeListIndex = index;
    }

    function addContactManual() {
      domServices.modal('contactList-addContactManual');

    }

    function createContact() {
      var currentListId = vm.lists[vm.activeListIndex].id;

      domServices.modal('contactList-addContactManual', 'close');
      contactListServices.createUser(vm.newContact, currentListId).then(
        function(res) {},
        function(err) {}
      );
      vm.newContact = {};
    }

  }
})();
