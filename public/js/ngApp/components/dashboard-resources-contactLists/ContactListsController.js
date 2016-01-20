(function () {
  'use strict';
  angular.module('KliikoApp').controller('ContactListController', ContactListController);

  ContactListController.$inject = ['domServices','contactListServices', 'dbg', 'messenger', '$timeout'];
  function ContactListController(domServices, contactListServices, dbg, messenger, $timeout) {
    dbg.log2('#ContactListController  started');
    var vm =  this;

    vm.lists = [];
    vm.activeListIndex = null;
    vm.newContact = {};
    vm.newList = {};
    vm.modalErrors = {};

    vm.listItemClickHandle = listItemClickHandle;
    vm.addContactManual = addContactManual;
    vm.createContact = createContact;
    vm.addNewList = addNewList;
    vm.submitNewList = submitNewList;

    init();

    function init() {
      contactListServices.getContactLists().then(function (result) {
        vm.lists = result;

        if (vm.lists.length) {
          // select first element
          vm.activeListIndex = 0;

          prepareListControls();
        }
      });

      function prepareListControls() {
        for (var i = 0, len = vm.lists.length; i < len ; i++) {
          vm.lists[i].listControls = {
            checked: false
          }
        }
      }
    }

    function listItemClickHandle(item, index){
      vm.activeListIndex = index;
    }

    function addContactManual() {
      domServices.modal('contactList-addContactManual');
    }

    function createContact() {
      var currentListId = vm.lists[vm.activeListIndex].id;

      var valid = validate();

      if (!valid) return;

      contactListServices.createUser(vm.newContact, currentListId).then(
        function(res) {
          domServices.modal('contactList-addContactManual', 'close');
        },
        function(err) {
          if (err.errors) {
            var e = err.errors;
            for (var i = 0, len = e.length; i < len ; i++) {
              vm.modalErrors[ e[i].path ] = e[i].message;
            }
          }

        }
      );
      vm.newContact = {};

      return;

      function validate() {
        if (!vm.newContact.firstName || !vm.newContact.firstName.length) vm.modalErrors.firstName = 'First Name cannot be blank';
        if (!vm.newContact.lastName || !vm.newContact.lastName.length) vm.modalErrors.lastName = 'Last Name cannot be blank';
        if (!vm.newContact.email || !vm.newContact.email.length) vm.modalErrors.email = 'Email cannot be blank';
        if (!vm.newContact.gender || !vm.newContact.gender.length) vm.modalErrors.gender = 'Gender should be selected';
      }
    }

    function addNewList() {
      domServices.modal('contactList-addNewListModal');
    }

    function submitNewList() {
      if (!vm.newList.name) {
        dbg.log2('#ContactListController > submitNewList > error > list name is empty');
        messenger.error('List Name can not be blank');
        return;
      }

      contactListServices.submitNewList(vm.newList).then(
        function(res) {
          dbg.log('#ContactListController > submitNewList > succes: New List "'+ res.name + '" added');
          vm.newList = {};
          vm.lists.push(res);
          domServices.modal('contactList-addNewListModal', 'close');
          messenger.ok('New List "'+ res.name + '" added');
        },
        function(err) {
          dbg.error('#ContactListController > submitNewList > error: ', err);

        }

      );
    }

  }
})();
