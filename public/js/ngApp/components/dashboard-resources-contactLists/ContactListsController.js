(function () {
  'use strict';
  angular.module('KliikoApp').controller('ContactListController', ContactListController);

  ContactListController.$inject = ['domServices','contactListServices', 'dbg', 'messenger', '$timeout'];
  function ContactListController(domServices, contactListServices, dbg, messenger, $timeout) {
    dbg.log2('#ContactListController  started');
    var vm =  this;

    vm.lists = [];
    vm.activeListIndex = null;
    vm.selectedListMembers = [];
    vm.newContact = {};
    vm.newList = {};
    vm.modalErrors = {};

    vm.listItemClickHandle = listItemClickHandle;
    vm.addContactManual = addContactManual;
    vm.createContact = createContact;
    vm.removeContacts = removeContacts;
    vm.addNewList = addNewList;
    vm.submitNewList = submitNewList;

    init();

    function init() {
      contactListServices.getContactLists().then(function (result) {
        vm.lists = result;

        if (vm.lists.length) {
          // select first element
          vm.activeListIndex = 0;
          vm.selectedListMembers = vm.lists[vm.activeListIndex].members;

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

      var currentList = vm.lists[vm.activeListIndex];

      var valid = validate();

      if (!valid) return;

      contactListServices.createUser(vm.newContact, currentList.id).then(
        function(res) {
          var newContact = vm.newContact;

          domServices.modal('contactList-addContactManual', 'close');
          messenger.ok('New contact '+ newContact.firstName + ' was added to list '+ currentList.name);
          vm.newContact = {};
          newContact.id = res.id;

          vm.selectedListMembers.push(newContact);

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




      function validate() {
        vm.modalErrors = {};
        var valid = true;
        if (!vm.newContact.firstName || !vm.newContact.firstName.length) { vm.modalErrors.firstName = 'First Name cannot be blank'; valid = false; }
        if (!vm.newContact.lastName || !vm.newContact.lastName.length) { vm.modalErrors.lastName = 'Last Name cannot be blank';valid = false; }
        if (!vm.newContact.email || !vm.newContact.email.length) {vm.modalErrors.email = 'Email cannot be blank';valid = false; }
        if (!vm.newContact.gender || !vm.newContact.gender.length) {vm.modalErrors.gender = 'Gender should be selected';valid = false; }

        return valid;
      }

    }

    function removeContacts(ids) {
      console.log(ids);
      contactListServices.deleteUser(ids).then(
        function(res) {

          if (!res.total) {
            messenger.error('No users was removed');
            return
          }

          var message;
          //res.total > 1
          messenger.ok('Removed');

          //vm.selectedListMembers.push(newContact);
          // listMembers--;

        },
        function(err) {
          messenger.error(err);

        }
      );
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
