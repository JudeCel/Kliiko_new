(function () {
  'use strict';
  angular.module('KliikoApp').controller('ContactListController', ContactListController);

  ContactListController.$inject = ['domServices', 'dbg', 'messenger', 'ListsModel', '$scope', 'contactListsControllerServices', 'ngDraggable'];
  function ContactListController(domServices,  dbg, messenger, ListsModel, $scope, contactListsControllerServices, ngDraggable) {
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
    vm.importData = { excel:false, csv:false, fileToImport: null};
    vm.basePath = '/js/ngApp/components/dashboard-resources-contactLists/';
    
    vm.importedFields = [];
    vm.contactListDropItems = [];
    vm.validContactList = [];
    vm.contactListToAdd = [];

    vm.addNewList = addNewList;
    vm.submitNewList = submitNewList;
    vm.updateList = updateList;
    vm.deleteList = deleteList;
    vm.editCustomFields = editCustomFields;
    vm.updateTableSorting = updateTableSorting;

    vm.changeTableSortingFilter = changeTableSortingFilter;
    vm.showManageColumnsModal = showManageColumnsModal;

    vm.contactAddEditClickHandle = contactAddEditClickHandle;
    vm.createContact = createContact;
    vm.updateContact = updateContact;
    vm.removeContacts = removeContacts;

    vm.selectAll = selectAll;
    vm.massDelete = massDelete;

    vm.startImport = startImport;

    /**
     * Open modal and prepare variables
     */
    function addNewList() {
      vm.listIdToEdit = null;
      vm.listModalTitle = 'Add New List';
      domServices.modal('contactList-addNewListModal');
    }
    
    vm.addNewListFieldMapping = function() {
      vm.listIdToEdit = null;
      vm.listModalTitle = 'Add New List';
      domServices.modal('contactList-addNewListFieldsModal');
    };
    
    vm.onFieldMapDrop = function(dataSource, dataTarget) {
      if (dataSource.field) {
        dataTarget.field = dataSource.field;
      } else {
        dataTarget.field = dataSource;
      }    
    };
          
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
        if (list[key].length) output.customFields.push(list[key]);
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

    function updateTableSorting(draggedIndex, droppedIndex) {
      dbg.log2('#ContactListController  > updateTableSorting > draggedIndex, droppedIndex : ',draggedIndex, droppedIndex );
      vm.lists.activeList.updateTableSortingByDragging(draggedIndex, droppedIndex);
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
      }

      if (action === 'update') {
        vm.contactModalTitle = 'Edit Contact';
        vm.newContact = contactObj;
        vm.updateExistingUser = true;
      }

      if (action === 'excel') {
        vm.updateExistingUser = null;
        vm.contactModalTitle = 'Add New Contacts From Excel';
        vm.importData = { excel:true, csv: false, fileToImport: null};
      }

      if (action === 'csv') {
        vm.updateExistingUser = null;
        vm.contactModalTitle = 'Add New Contacts From Excel';
        vm.importData = { excel:false, csv: true, fileToImport: null};

      }

      vm.newContact = {};
      vm.modalErrors = {};
      domServices.modal('contactList-addContactManual');
    }


    /**
     * create a contact for currently active list
     */
    function createContact() {
      var currentList = vm.lists.activeList;

      var valid = validateContact();

      if (!valid) return;

      var newContact = angular.copy(vm.newContact);

      vm.lists.addNewContact(vm.newContact).then(
        function(res) {
          vm.newContact = {customFields:{}};

          domServices.modal('contactList-addContactManual', 'close');
          messenger.ok('New contact '+ newContact.firstName + ' was added to list '+ currentList.name);
        },
        function (err) {
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

    function updateContact() {

      var newContact = angular.copy(vm.newContact);
      var currentList = angular.copy(vm.lists.activeList);

      vm.lists.updateContact(vm.newContact).then(
        function(res) {
          vm.newContact = {customFields:{}};

          domServices.modal('contactList-addContactManual', 'close');
          messenger.ok('New contact '+ newContact.firstName + ' was added to list '+ currentList.name);
        },
        function (err) {
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
     * Remove contacts from list by given ids
     * @param ids {number | [{numbers}]}
     */
    function removeContacts(ids) {
      if (!ids) return;
      if (!angular.isArray(ids)) ids = [ids];

      var confirmed = confirm('Are you sure?');
      if (!confirmed) return;

      vm.lists.deleteContacts(ids).then(
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

        },
        function(err) {  messenger.error(err); }
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

    /**
     * Toggle selection for all items in contacts list
     */
    function selectAll() {
      vm.allSelected = !vm.allSelected;
      for (var i = 0, len = vm.lists.activeList.members.length; i < len ; i++) {
        vm.lists.activeList.members[i]._selected = vm.allSelected;
      }
    }

    /**
     * Delete all contacts that are selected in current list
     */
    function massDelete() {
      var ids = [];
      for (var i = 0, len = vm.lists.activeList.members.length; i < len ; i++) {
        if (vm.lists.activeList.members[i]._selected === true) ids.push(vm.lists.activeList.members[i].id);
      }

      if (!ids.length) return;

      removeContacts(ids);
    }

    function startImport() {
      if (!vm.importData.file) return;

      contactListsControllerServices.uploadImportFile(vm.importData.file, vm.lists.activeList.id).then(
        function (res) {
          processImportData(res);
        },
        function (err) {
        }
      );
    }
    
    function processImportData(res) {
      //fields for left column in mapping
      vm.importedFields = res.data.result.fileFields;
      vm.validContactList = res.data.result.valid;
      
      //fill values for right column
      var array = [];
      var len = res.data.result.contactListFields.defaultFields.length;
      for (var i = 0; i < len; i++) {
        array[i] = { name: res.data.result.contactListFields.defaultFields[i] }
      }
      //fields for right column in mapping
      vm.contactListDropItems = array;
      domServices.modal('contactList-addContactManual', 'close');
      vm.addNewListFieldMapping();
      
      if (!vm.validContactList.length) {
        messenger.error('Imported contact list is empty');
      }
    }
    
    //assigns contact info to mapped fields
    vm.mappingFieldsContinue = function() {
      var userList = [];
      for (var j = 0; j < vm.validContactList.length; j++ ) {
        var user = {};
        for (var i = 0; i < vm.contactListDropItems.length; i++) {
          if (vm.contactListDropItems[i].field) {
            user[vm.contactListDropItems[i].name] = vm.validContactList[j][vm.contactListDropItems[i].field];
          }
        }//for
        userList.push(user);
      }//for
      vm.contactListToAdd = userList;
      
      console.log(vm.contactListToAdd);
      domServices.modal('contactList-addNewListFieldsPreviewModal');      
    }

  }
})();
