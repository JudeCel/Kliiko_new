(function () {
  'use strict';
  angular.module('KliikoApp').controller('ContactListController', ContactListController);

  ContactListController.$inject = ['domServices', 'dbg', 'messenger', 'ListsModel', '$scope', 'contactListsControllerServices', 'ngDraggable', '$timeout'];
  function ContactListController(domServices,  dbg, messenger, ListsModel, $scope, contactListsControllerServices, ngDraggable, $timeout) {
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
    vm.importErrorMessage = null;

    vm.importedFields = [];
    vm.contactListDropItems = [];
    vm.validContactList = [];
    vm.contactListToAdd = [];

    vm.changeActiveList = changeActiveList;
    vm.addNewList = addNewList;
    vm.submitNewList = submitNewList;
    vm.updateList = updateList;
    vm.deleteList = deleteList;
    vm.editCustomFields = editCustomFields;
    vm.updateTableSorting = updateTableSorting;

    vm.changeTableSortingFilter = changeTableSortingFilter;
    vm.showManageColumnsModal = showManageColumnsModal;

    vm.updateOrCreateContact = updateOrCreateContact;
    vm.contactAddEditClickHandle = contactAddEditClickHandle;
    vm.createContact = createContact;
    vm.updateContact = updateContact;
    vm.removeContacts = removeContacts;

    vm.selectAll = selectAll;
    vm.massDelete = massDelete;

    vm.startImport = startImport;
    vm.additionalMappingFieldname = "";

    vm.clearImportErrors = clearImportErrors;
    vm.reUpload = reUpload;
    vm.reMap = reMap;
    vm.addImportedContacts = addImportedContacts;

    vm.onFieldMapDrop = onFieldMapDrop;
    vm.mappingFieldsContinue = mappingFieldsContinue;


    function changeActiveList(index) {
      selectAll(true);
      vm.lists.changeActiveList(index);
      vm.allSelected = false;
    }

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
          vm.newList.name = "";
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

    function prepareCustomFields() {
      vm.listIdToEdit = vm.lists.activeList.id;
      vm.newList = {};
      vm.listModalTitle = 'Edit List And Custom Fields';

      // populate with existing data
      vm.newList.name = vm.lists.activeList.name;
      for (var i = 0, len = vm.lists.activeList.customFields.length; i < len ; i++) {
        var I = i+1;
        vm.newList['customField'+I] = vm.lists.activeList.customFields[i];
      }
    }

    function editCustomFields() {
      vm.modalTab2 = true;
      prepareCustomFields();
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




    function updateOrCreateContact() {
      vm.updateExistingUser
        ? updateContact()
        : createContact();
    }

    /**
     * Add New or Edit Existing contact
     * @param action {string}
     * @param [contactObj] {object} - contact object required for editing case
     */
    function contactAddEditClickHandle(action, contactObj) {
      vm.importData = null;
      vm.importErrorMessage = null;
      vm.newContact = {};
      vm.modalErrors = {};

      if (action === 'new') {
        vm.updateExistingUser = null;
        vm.contactModalTitle = 'Add New Contact';
      }

      if (action === 'update') {
        vm.contactSnapshot = angular.copy(contactObj);

        vm.contactModalTitle = 'Edit Contact';
        vm.newContact = contactObj;
        vm.updateExistingUser = true;
      }

      if (action == 'cancel') {
        for (var i = 0, len = vm.lists.activeList.members.length; i < len ; i++) {
          if (vm.lists.activeList.members[i].id == vm.contactSnapshot.id) {
            vm.lists.activeList.members[i] = angular.copy(vm.contactSnapshot);
            vm.contactSnapshot = null;
            break;

          }
        }
      }

      if (action === 'excel') {
        vm.updateExistingUser = null;
        vm.contactModalTitle = 'Add New Contacts From Excel';
        vm.importData = { excel:true, csv: false, fileToImport: null};
      }

      if (action === 'csv') {
        vm.updateExistingUser = null;
        vm.contactModalTitle = 'Add New Contacts From CSV';
        vm.importData = { excel:false, csv: true, fileToImport: null};

      }


      domServices.modal('contactList-addContactManual');
    }


    /**
     * create a contact for currently active list
     */
    function createContact() {
      var currentList = vm.lists.activeList;

      var newContact = angular.copy(vm.newContact);
      if(validatePhoneNumber() && validateLandlineNumber(newContact.landlineNumber)){
        vm.lists.addNewContact(vm.newContact).then(
          function(res) {
            vm.newContact = {customFields:{}};

            domServices.modal('contactList-addContactManual', 'close');
            messenger.ok('New contact '+ newContact.firstName + ' was added to list '+ currentList.name);
          },
          function (err) {
            vm.modalErrors = err;
          }
        );
      }
    }

    function updateContact() {

      var newContact = angular.copy(vm.newContact);
      var currentList = angular.copy(vm.lists.activeList);
      if(validatePhoneNumber() && validateLandlineNumber(newContact.landlineNumber)){
        vm.lists.updateContact(vm.newContact).then(
          function(res) {
            vm.newContact = {customFields:{}};

            domServices.modal('contactList-addContactManual', 'close');
            messenger.ok('Contact '+ newContact.firstName + ' has been updated');
          },
          function (err) {
            vm.modalErrors = err;
          }
        );
      }

    }

    function validatePhoneNumber() {
      if(!validatePhone()){
        messenger.error("The mobile number for this country is not valid.");
        return false;
      }
      return true;
    }

    function validateLandlineNumber(landlineNumber) {
      if(landlineNumber && !validLandlineNumber()){
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
     * Toggle selection for all items in contacts list
     * @param [forceUnselect] {boolean} if true - will not togle, but will turn all off
     */
    function selectAll(forceUnselect) {
      forceUnselect
        ? vm.allSelected = false
        : vm.allSelected = !vm.allSelected;

      if (!vm.lists.activeList.members) return;

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
      selectAll();
    }

    function startImport() {
      if (!vm.importData.file) return;

      vm.lists.parseImportFile(vm.importData.file).then(
        function(res) {
          domServices.modal('contactList-addContactManual','close');
          vm.lists.generateImportPreview(res.data);
          domServices.modal('modals-import-preview');
          processImportData(res);

        },
        function(err) {
          messenger.error('Import Failed');
          vm.importErrorMessage = 'This file media type is not recognized or it is corrupted. Please, choose another file.'
        }
      );



    }

    function prepareListForMapping(list) {
      var len = list.length;
      var array = [];
      for (var i = 0; i < len; i++) {
        array[i] = { name: list[i] }
      }
      return array;
    }

    function processImportData(res) {
      //fields for left column in mapping
      vm.importedFields = res.data.fileFields;
      vm.validContactList = res.data.valid.concat(res.data.invalid);

      //fill values for right column
      var array = [];
      var list = res.data.contactListFields.defaultFields;
      var len = list.length;

      for (var i = 0; i < len; i++) {
        array[i] = { name: list[i] }

      }
      //fields for right column in mapping
      vm.contactListDropItems.defaultFields = prepareListForMapping(res.data.contactListFields.defaultFields);
      vm.contactListDropItems.customFields = prepareListForMapping(vm.lists.activeList.customFields);



      vm.modalTab1 = true;

      domServices.modal('contactList-addContactManual', 'close');
      prepareCustomFields();



      for (var j = 0; j < vm.importedFields.length; j++) {
        for (var i = 0; i < vm.contactListDropItems.defaultFields.length; i++) {
          if (vm.contactListDropItems.defaultFields[i].name == vm.importedFields[j]) {
            vm.contactListDropItems.defaultFields[i].field = vm.importedFields[j];
          }
        }

        for (i = 0; i < vm.contactListDropItems.customFields.length; i++) {
          if (vm.contactListDropItems.customFields[i].name == vm.importedFields[j]) {
            vm.contactListDropItems.customFields[i].field = vm.importedFields[j];
          }
        }
      }
    }

    // Drag and drop fields section
    function onFieldMapDrop(dataSource, dataTarget) {
      if (dataSource.field) {
        dataTarget.field = dataSource.field;
        dataSource.field = null;
      } else {
        dataTarget.field = dataSource;
      }
    }

    //assigns contact info to mapped fields
    function mappingFieldsContinue() {

      var output = {valid:[], invalid:[], duplicateEntries: []};
      var userList = [];
      for (var j = 0; j < vm.validContactList.length; j++ ) {
        var user = {};
        for (var i = 0; i < vm.contactListDropItems.customFields.length; i++) {
          if (vm.contactListDropItems.customFields[i].field) {
            user[vm.contactListDropItems.customFields[i].name] = vm.validContactList[j][vm.contactListDropItems.customFields[i].field];
          }
        }//for

        for (var i = 0; i < vm.contactListDropItems.defaultFields.length; i++) {
          if (vm.contactListDropItems.defaultFields[i].field) {
            user[vm.contactListDropItems.defaultFields[i].name] = vm.validContactList[j][vm.contactListDropItems.defaultFields[i].field];
          }
        }//for

        user.rowNr = vm.validContactList[j].rowNr;

        userList.push(user);
      }//for
      vm.contactListToAdd = userList;

      output.valid = userList;

      vm.lists.generateImportPreview(output);

      domServices.modal('contactList-addNewListFieldsModal', 'close');
      domServices.modal('modals-import-preview');
    }

    vm.clearDoppedItem = function(item) {
      item.field = null;
    };

    vm.updateCustomFieldList = function() {
      if (vm.newListErrorMessage) return;
      if (!vm.newList.name) {
        dbg.log2('#ContactListController > updateList > error > list name is empty');
        messenger.error('List Name can not be blank');
        return;
      }
      var newList = angular.copy(vm.newList);
      var parsedList = prepareParsedList(vm.newList);
      updateActiveCustomList(newList, parsedList);
    };

    function updateActiveCustomList(newList, parsedList) {
      vm.lists.updateActiveItem(parsedList).then(
        function (res) {
          messenger.ok('List "'+ newList.name + '" updated');
          prepareCustomFields();
          vm.contactListDropItems.customFields = prepareListForMapping(vm.lists.activeList.customFields);
        },
        function (err) {
          messenger.error('Could not update new list: '+ err);
          dbg.error('#ContactListController > updateList > error: ', err);
        }
      );
    }


    function clearImportErrors() {
      vm.importErrorMessage = null;
    }
    function reUpload() {
      domServices.modal('modals-import-preview','close');
      domServices.modal('contactList-addNewListFieldsModal','close');
      // timeout is to wait fade effects
      setTimeout(function() {
        var type;
        if (vm.importData.excel) type = 'excel';
        if (vm.importData.csv) type = 'csv';
        contactAddEditClickHandle(type);
      }, 800);
      clearImportErrors();
    }
    function reMap() {
      domServices.modal('modals-import-preview', 'close');
      prepareCustomFields();
      vm.addNewListFieldMapping();
    }

    vm.addCustomField = function() {
      var newList = angular.copy(vm.newList);
      var parsedList = prepareParsedList(vm.newList);
      parsedList.customFields.push(vm.additionalMappingFieldname);
      vm.additionalMappingFieldname = "";
      updateActiveCustomList(newList, parsedList);
    };

    function addImportedContacts() {

      if (!vm.lists.importPreviewArray.length) return;

      vm.lists.addImportedContacts().then(
        function(res) {
          domServices.modal('modals-import-preview', 'close');

          messenger.ok('New contacts has been imported to list '+ vm.lists.activeList.name);
        },
        function(err) {

          messenger.error('Import Failed. Check error(s)');
          for (var key in err) {
            for (var i = 0, len = vm.lists.importPreviewArray.length; i < len ; i++) {
              if (vm.lists.importPreviewArray[i].rowNr == key) {
                vm.lists.importPreviewArray[i].validationErrors = err[key]
              }
            }
          }


        }
      );
    }

  }
})();
