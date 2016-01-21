(function () {
  'use strict';
  angular.module('KliikoApp').controller('ContactListController', ContactListController);

  ContactListController.$inject = ['domServices','contactListServices', 'dbg', 'messenger', '$timeout', '$scope'];
  function ContactListController(domServices, contactListServices, dbg, messenger, $timeout, $scope) {
    dbg.log2('#ContactListController  started');
    var vm =  this;

    vm.lists = [];
    vm.activeListIndex = null;
    vm.selectedListMembers = [];
    vm.newContact = {};
    vm.newList = {};
    vm.modalErrors = {};
    vm.allSelected = false;

    vm.listItemClickHandle = listItemClickHandle;
    vm.addContactManual = addContactManual;
    vm.createContact = createContact;
    vm.selectAll = selectAll;
    vm.removeContacts = removeContacts;
    vm.massDelete = massDelete;
    vm.addNewList = addNewList;
    vm.submitNewList = submitNewList;
    vm.removeList = removeList;


    init();

    function init() {
      contactListServices.getContactLists().then(function (result) {
        vm.lists = result;

        if (vm.lists.length) {
          // select first element
          vm.activeListIndex = 0;
          vm.selectedListMembers = vm.lists[vm.activeListIndex].members;

          prepareSelectedListMembersControls();
        }
      });
    }


    function prepareSelectedListMembersControls() {
      if (!vm.selectedListMembers) return;

      for (var i = 0, len = vm.selectedListMembers.length; i < len ; i++) {
        if (!vm.selectedListMembers[i].selected) vm.selectedListMembers[i].selected = false;
      }
    }

    /**
     * Go to selected list
     * @param index {number} - index in vm.lists array
     */
    function listItemClickHandle(index){
      vm.activeListIndex = index;
      vm.selectedListMembers = vm.lists[vm.activeListIndex].members;

      prepareSelectedListMembersControls();
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
          vm.lists[vm.activeListIndex].membersCount++;
          if (!vm.selectedListMembers) vm.selectedListMembers = [];
          vm.selectedListMembers.push(newContact);
          prepareSelectedListMembersControls();

        },
        function(err) {
          if (err.error) {
            messenger.error(err.error.message);
          }
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

    function selectAll() {
      vm.allSelected = !vm.allSelected;
      for (var i = 0, len = vm.selectedListMembers.length; i < len ; i++) {
        vm.selectedListMembers[i]._selected = vm.allSelected;
      }
    }

    /**
     * Remove contacts from list by given ids
     * @param ids {number | [{numbers}]}
     */
    function removeContacts(ids) {
      if (!ids) return;
      if (!angular.isArray(ids)) ids = [ids];

      var confirmed = confirm('Are you sure?');
      if (!confirmed) return;

      contactListServices.deleteUser(ids).then(
        function(res) {

          if (!res.total) {
            messenger.error('No users was removed');
            return
          }

          var message;
          (res.total > 1)
            ? message = res.total+' users has been removed'
            : message = 'User removed';

          messenger.ok(message);

          // remove this user(s) from view
          for (var i = 0, len = ids.length; i < len ; i++) {

            for (var j = 0; j < vm.selectedListMembers.length; j++) {
              if (vm.selectedListMembers[j].id == ids[i]) {
                vm.selectedListMembers.splice( j, 1 );
                vm.lists[vm.activeListIndex].membersCount--
              }
            }

          }
        },
        function(err) {  messenger.error(err); }
      );
    }

    function massDelete() {
      var ids = [];
      for (var i = 0, len = vm.selectedListMembers.length; i < len ; i++) {
        if (vm.selectedListMembers[i]._selected === true) ids.push(vm.selectedListMembers[i].id);
      }

      removeContacts(ids);
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

    function removeList() {
      var confirmed = confirm('Are you sure?');
      if (!confirmed) return;

      var list = vm.lists[vm.activeListIndex];
      contactListServices.deleteList( list.id ).then(
        function(res) {
          if (!res.success) {
            dbg.error('#ContactListController > removeList > something wrong with res output');
            messenger.error('There is an error while removing the list');
            return;
          }

          //delete from view
          vm.lists.splice(vm.activeListIndex, 1);

          //select previous in array list
          //debugger
          vm.activeListIndex--;
          if (vm.activeListIndex < 0) vm.activeListIndex = 0;
          listItemClickHandle(vm.activeListIndex);

          dbg.log('#ContactListController > removeList > success: List "'+ list.name + '" removed');
          messenger.ok('List "'+ list.name +'" successfully removed');
        },
        function(err) {
          messenger.error('There is an error while removing the list');
          dbg.error('#ContactListController > removeList > error: ', err);
        }
      )
    }






  }
})();
