(function () {
  'use strict';
  angular.module('KliikoApp').controller('ContactListController', ContactListController);

  ContactListController.$inject = ['domServices', 'dbg', 'messenger', 'ListsModel'];
  function ContactListController(domServices,  dbg, messenger, ListsModel) {
    dbg.log2('#ContactListController  started');
    var vm =  this;

    vm.listIdToEdit = null;
    vm.newList = {};
    vm.lists = new ListsModel();
    vm.newList = {};
    vm.modalErrors = {};
    vm.allSelected = false;
    vm.tableSort = {by: null, reverse: false};
    vm.modContentBlock= {generalDetails:true, history: false};

    vm.addNewList = addNewList;
    vm.submitNewList = submitNewList;
    vm.updateList = updateList;
    vm.deleteList = deleteList;
    vm.editCustomFields = editCustomFields;

    vm.changeTableSortingFilter = changeTableSortingFilter;
    vm.showManageColumnsModal = showManageColumnsModal;

    vm.contactAddEditClickHandle = contactAddEditClickHandle;
    vm.createContact = createContact;

    /**
     * Open modal and prepare variables
     */
    function addNewList() {
      vm.listIdToEdit = null;
      vm.listModalTitle = 'Add New List';
      domServices.modal('contactList-addNewListModal');
    }

    function submitNewList() {
      if (vm.newListErrorMessage) return;

      // if ng-submit fires for add new, while we updating existent
      if (vm.listIdToEdit) {
        updateList();
        return
      }

      if (!vm.newList.name) {
        dbg.log2('#ContactListController > submitNewList > error > list name is empty');
        messenger.error('List Name can not be blank');
        return;
      }

      var parsedList = prepareParsedList(vm.newList);
      vm.lists.addNew(parsedList).then(
        function(res) {
          vm.newList = {};

          domServices.modal('contactList-addNewListModal', 'close');
          messenger.ok('New List "'+ res.name + '" added');

          vm.lists.changeActiveList(vm.lists.items.length -1);

        },
        function(err) {
          messenger.error('Could not create new list: '+ err);
          dbg.error('#ContactListController > submitNewList > error: ', err);
        }
      )

    }

    function updateList() {
      if (vm.newListErrorMessage) return;

      if (!vm.newList.name) {
        dbg.log2('#ContactListController > updateList > error > list name is empty');
        messenger.error('List Name can not be blank');
        return;
      }


      var newList = angular.copy(vm.newList);

      var parsedList = prepareParsedList(vm.newList);

      vm.lists.updateActiveItem(parsedList).then(
        function (res) {
          domServices.modal('contactList-addNewListModal', 'close');
          messenger.ok('List "'+ newList.name + '" updated');

          vm.newList = {};
        },
        function (err) {
          messenger.error('Could not update new list: '+ err);
          dbg.error('#ContactListController > updateList > error: ', err);
        }
      );




    }

    function prepareParsedList(list) {
      var output = {
        name: list.name,
        customFields: []
      };
      delete list.name;

      for (var key in list) {
        output.customFields.push(list[key]);
      }

      return output
    }

    function deleteList(listItem, index) {
      var confirmed = confirm('Are you sure?');
      if (!confirmed) return;

      vm.lists.delete(listItem, index).then(
        function (res) {
          dbg.log('#ContactListController > removeList > success: List "'+ listItem.name + '" removed');
          messenger.ok('List "'+ listItem.name +'" successfully removed');

          var newIndex = vm.lists.activeListIndex - 1;
          vm.lists.changeActiveList(newIndex)

        },
        function (err) {
          messenger.error('There is an error while removing the list');
          dbg.error('#ContactListController > removeList > error: ', err);
        }
      );



    }

    function editCustomFields() {
      vm.listIdToEdit = vm.lists.activeList.id;
      vm.newList = {};

      vm.modalTab2 = true;
      vm.listModalTitle = 'Edit List And Custom Fields';

      // populate with existing data
      vm.newList.name = vm.lists.activeList.name;
      for (var i = 0, len = vm.lists.activeList.customFields.length; i < len ; i++) {
        var I = i+1;
        vm.newList['customField'+I] = vm.lists.activeList.customFields[i];
      }

      domServices.modal('contactList-addNewListModal');

    }

    /**
     * Sort table row by seleclted filter
     * @param type {string}
     */
    function changeTableSortingFilter(type) {
      vm.tableSort.by =  type;
      vm.tableSort.reverse = !vm.tableSort.reverse;
    }

    function showManageColumnsModal() {
      domServices.modal('contactList-manageColumns');
      vm.selectedTables = {};
      var tablesToShowArray = vm.lists.activeList.visibleFields;
      for (var i = 0, len = tablesToShowArray.length; i < len ; i++) {
        vm.selectedTables[tablesToShowArray[i]] = true;

      }
    }


    /**
     * Add New or Edit Existing contact
     * @param action {string}
     * @param [contactObj] {object} - contact object required for editing case
     */
    function contactAddEditClickHandle(action, contactObj) {
      if (action === 'new') {
        vm.updateExistingUser = null;
        vm.contactModalTitle = 'Add New Contact';
        vm.newContact = {};
      }

      if (action === 'update') {
        vm.contactModalTitle = 'Edit Contact';
        vm.newContact = contactObj;
        vm.updateExistingUser = true;
      }

      domServices.modal('contactList-addContactManual');
    }



    /**
     * create a contact for currently active list
     */
    function createContact() {

      var currentList = vm.lists[vm.activeListIndex];

      var valid = validateContact();

      if (!valid) return;

      var newContact = angular.copy(vm.newContact);
      newContact = new Member(newContact);
      newContact.updateFields();

      contactListServices.createUser(vm.newContact, currentList.id).then(
        function(res) {
          domServices.modal('contactList-addContactManual', 'close');
          messenger.ok('New contact '+ newContact.firstName + ' was added to list '+ currentList.name);

          vm.newContact = {customFields:{}};
          newContact.id = res.id;

          if (!vm.lists[vm.activeListIndex].membersCount) vm.lists[vm.activeListIndex].membersCount = 0 ;
          vm.lists[vm.activeListIndex].membersCount++;

          if (!vm.selectedListMembers) vm.selectedListMembers = [];
          vm.selectedListMembers.push(newContact);

          cls.addNewUserToList(currentList.id, newContact);

          for (var i = 0, len = vm.selectedListMembers.length; i < len ; i++) {
            if (vm.selectedListMembers[i].CustomFieldsObject && vm.lists[vm.activeListIndex].members) {
              vm.selectedListMembers[i].name = vm.selectedListMembers[i].firstName + ' '+ vm.selectedListMembers[i].lastName;
              for( var key in vm.selectedListMembers[i].CustomFieldsObject ) {
                vm.lists[vm.activeListIndex].Members[i][key] = vm.selectedListMembers[i].CustomFieldsObject[key];
              }
            }
          }



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
    }

    /**
     * Validate vm.newContact object
     * @returns {boolean}
     */
    function validateContact() {
      vm.modalErrors = {};
      var valid = true;
      if (!vm.newContact.firstName || !vm.newContact.firstName.length) { vm.modalErrors.firstName = 'First Name cannot be blank'; valid = false; }
      if (!vm.newContact.lastName || !vm.newContact.lastName.length) { vm.modalErrors.lastName = 'Last Name cannot be blank';valid = false; }
      if (!vm.newContact.email || !vm.newContact.email.length) {vm.modalErrors.email = 'Email cannot be blank';valid = false; }
      if (!vm.newContact.gender || !vm.newContact.gender.length) {vm.modalErrors.gender = 'Gender should be selected';valid = false; }

      return valid;
    }


  }
})();
