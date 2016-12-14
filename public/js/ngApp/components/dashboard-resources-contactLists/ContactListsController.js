(function () {
  'use strict';

  angular.module('KliikoApp').controller('ContactListController', ContactListController);

  ContactListController.$inject = ['domServices', 'dbg', 'messenger', 'ListsModel', '$scope', 'ngDraggable', '$timeout', 'messagesUtil', '$confirm'];
  function ContactListController(domServices,  dbg, messenger, ListsModel, $scope, ngDraggable, $timeout, messagesUtil, $confirm) {
    dbg.log2('#ContactListController  started');
    var vm =  this;

    vm.listIdToEdit = null;
    vm.sessionId = null;
    vm.newList = {};
    vm.lists = {};
    vm.newList = {};
    vm.modalErrors = {};
    vm.allSelected = false;
    vm.tableSort = {by: null, reverse: false};
    vm.modContentBlock= {generalDetails:true, history: false};
    vm.importData = { excel:false, csv:false, fileToImport: null};
    vm.basePath = '/js/ngApp/components/dashboard-resources-contactLists/';
    vm.importErrorMessage = null;
    vm.disableNextSortingEvent = false;

    vm.hideStuff = false;
    vm.hideModalStuff = false;
    vm.importedFields = [];
    vm.contactListDropItems = [];
    vm.contactListToAdd = [];
    vm.showContactComments = { 
      pagination: {
        currentPage: 1,
        itemsPerPage: 5,
        totalItems : 0,
        items: {}
      }
    };

    vm.initLists = initLists;
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
    vm.canSelectMember = canSelectMember;

    vm.startImport = startImport;
    vm.additionalMappingFieldname = "";

    vm.clearImportErrors = clearImportErrors;
    vm.reUpload = reUpload;
    vm.reMap = reMap;
    vm.addImportedContacts = addImportedContacts;

    vm.onFieldMapDrop = onFieldMapDrop;
    vm.mappingFieldsContinue = mappingFieldsContinue;
    vm.setSessionId = setSessionId;
    vm.returnContactCount = returnContactCount;
    vm.returnSelectedCount = returnSelectedCount;
    vm.canAddMoreFields = canAddMoreFields;
    vm.requireField = requireField;
    vm.isObserverListSelected = isObserverListSelected;
    vm.findIndexByListName = findIndexByListName;
    vm.disableNextSortingFilter = disableNextSortingFilter;
    vm.showContactCommentsModal = showContactCommentsModal; 
    vm.prepareCurrentPageComments = prepareCurrentPageComments;

    vm.pagination = {
      currentPage: 1,
      itemsPerPage: 10
    }

    var facilitatorsListName = "Hosts";
    var observersListName = "Spectators";

    // required for correct list switching.
    var isSelected = false;

    function requireField(field) {
      if (vm.lists.activeList && vm.lists.activeList.reqiredFields.indexOf(field) > -1) {
        return "*"
      } else {
        return ""
      }
    }

    function initLists(listType) {
      new ListsModel({sessionId: vm.sessionId}).then(function(result) {
        vm.lists = result;

        if(vm.listIgnoring) {
          removeSpecificLists();
        }

        if (listType == 'facilitators') {
          vm.sectListActiveToFacilitators();
        } else if (listType == "inviteSessionObservers") {
          vm.changeActiveList(findIndexByListName(observersListName));
        } else {
          vm.changeActiveList(0);
        }
      });
    }

    function setSessionId(sessionId) {
      vm.sessionId = sessionId;
    }

    function removeSpecificLists() {
      var array = []
      var activeList = null;

      for(var i in vm.lists.items) {
        var item = vm.lists.items[i];
        if (vm.listIgnoring.include) {
          if(vm.listIgnoring.ids && vm.listIgnoring.ids.indexOf(item.id) >= 0
          || vm.listIgnoring.names && vm.listIgnoring.names.indexOf(item.name) >= 0) {
            array.push(item);
          }
        } else if (vm.listIgnoring.ignore) {
          if(vm.listIgnoring.ids && !vm.listIgnoring.ids.indexOf(item.id) >= 0
          || vm.listIgnoring.names && !vm.listIgnoring.names.indexOf(item.name) >= 0) {
            array.push(item);
          }
        }

        if(vm.listIgnoring.active && vm.listIgnoring.active.id == item.id || vm.listIgnoring.active.name == item.name) {
          activeList = item;
        }
      }

      vm.lists.activeList = activeList || array[0];
      vm.lists.items = array;
    }

    function returnSelectedCount(item) {
      if(item.members) {
        var count = 0;
        for(var i in item.members) {
          if(item.members[i]._selected) {
            count++;
          }
        }
        return count;
      }
      else {
        return 0;
      }
    }

    function returnContactCount(item) {
      if(item.members) {
        return item.members.length;
      }else{
        return 0;
      }
    }

    vm.sectListActiveToFacilitators = function() {
      if (isSelected) return;

      isSelected = true;
      // timeout is for correct list switching (think about it as of promise)
      setTimeout(function() {   vm.changeActiveList(findIndexByListName(facilitatorsListName))  }, 300);

    };


    function changeActiveList(index) {
      selectAll(true);
      var temp = vm.lists.changeActiveList(index, true);
      if (temp) {
        vm.name = temp.name;
      }
      vm.allSelected = false;
      vm.pagination.currentPage = 1;
    }


    function prepareDefaultCustomFields() {
      vm.newList = {customFields:{}, name: ""};
      for (var i = 0, len = vm.lists.activeList.maxCustomFields; i < len ; i++) {
        var I = i+1;
        vm.newList.customFields['customField'+I] = "";
      }
    }

    /**
     * Open modal and prepare variables
     */
    function addNewList() {
      vm.listIdToEdit = null;
      vm.listModalTitle = 'Add New List';
      prepareDefaultCustomFields();
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
        messenger.error(messagesUtil.contactList.listNameBlank);
        return;
      }

      var parsedList = prepareParsedList(vm.newList);
      vm.lists.addNew(parsedList).then(
        function(res) {
          vm.newList = {};

          domServices.modal('contactList-addNewListModal', 'close');
          messenger.ok(res.message);

          vm.changeActiveList(vm.lists.items.length -1);
          vm.newList.name = "";
          prepareCustomFields();
        },
        function(err) {
          messenger.error(err);
          dbg.error('#ContactListController > submitNewList > error: ', err);
        }
      )

    }

    function updateList() {
      if (vm.newListErrorMessage) return;
      if (!vm.newList.name) {
        dbg.log2('#ContactListController > updateList > error > list name is empty');
        messenger.error(messagesUtil.contactList.listNameBlank);
        return;
      }


      var newList = angular.copy(vm.newList);
      var parsedList = prepareParsedList(vm.newList);

      vm.lists.updateActiveItem(parsedList).then(
        function (res) {
          domServices.modal('contactList-addNewListModal', 'close');
          messenger.ok(res.message);

          vm.newList = {};
        },
        function (err) {
          messenger.error(err);
          dbg.error('#ContactListController > updateList > error: ', err);
        }
      );




    }

    function prepareParsedList(list) {
      var output = {
        name: list.name,
        customFields: []
      };

      for (var key in list.customFields) {
        if (list.customFields[key]) output.customFields.push(list.customFields[key]);
      }

      return output
    }

    function deleteList(listItem, index) {
      var confirmed = confirm('Are you sure, that you want to delete this contact list?');
      if (!confirmed) return;

      vm.lists.delete(listItem, index).then(
        function (res) {
          dbg.log('#ContactListController > removeList > success: List "'+ listItem.name + '" removed');
          messenger.ok(res.message);

          var newIndex = vm.lists.activeListIndex - 1;
          vm.lists.changeActiveList(newIndex)

        },
        function (err) {
          messenger.error(err);
          dbg.error('#ContactListController > removeList > error: ', err);
        }
      );



    }

    function prepareCustomFields() {
      vm.listIdToEdit = vm.lists.activeList.id;
      vm.newList = {customFields:{}, name: vm.lists.activeList.name};
      vm.listModalTitle = 'Edit List And Custom Fields';

      // populate with existing data
      vm.newList.name = vm.lists.activeList.name;
      for (var i = 0, len = vm.lists.activeList.maxCustomFields; i < len ; i++) {
        var I = i+1;
        vm.newList.customFields['customField'+I] = vm.lists.activeList.customFields[i];
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
      vm.disableNextSortingEvent = false;
    }

    function disableNextSortingFilter() {
      vm.disableNextSortingEvent = true;
    }

    /**
     * Sort table row by seleclted filter
     * @param type {string}
     */
    function changeTableSortingFilter(type) {
      if (vm.disableNextSortingEvent) {
        vm.disableNextSortingEvent = false;
      } else {
        vm.tableSort.by =  type;
        vm.tableSort.reverse = !vm.tableSort.reverse;
      }
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
        vm.newContact = angular.copy(contactObj);
        vm.updateExistingUser = true;
      }

      if (action == 'cancel') {
        for (var i = 0, len = vm.lists.activeList.members.length; i < len ; i++) {
          if ( vm.contactSnapshot) {
            if (vm.lists.activeList.members[i].id == vm.contactSnapshot.id) {
              vm.lists.activeList.members[i] = angular.copy(vm.contactSnapshot);
              vm.contactSnapshot = null;
              break;
            }
          }
        }
      }

      if (action === 'csv') {
        vm.updateExistingUser = null;
        vm.contactModalTitle = 'Add New Contacts From CSV';
        vm.importData = { excel:false, csv: true, fileToImport: null};

      }

      vm.canAddNew = false;
      domServices.modal('contactList-addContactManual');
    }


    /**
     * create a contact for currently active list
     */
    function createContact() {
      var currentList = vm.lists.activeList;
      var newContact = angular.copy(vm.newContact);

      vm.lists.addNewContact(vm.newContact).then(function(res) {
        vm.newContact = {customFields:{}};

        if(!vm.canAddNew) {
          domServices.modal('contactList-addContactManual', 'close');
        }
        vm.modalErrors = {};
        messenger.ok(res.message);
      }, function (err) {
        if(err.subEnded){
          messenger.error(err);
        }else{
          vm.modalErrors = err;
        }
      });
    }

    function updateContact() {
      var currentList = vm.lists.activeList;
      var newContact = angular.copy(vm.newContact);

      vm.lists.updateContact(vm.newContact).then(function(res) {
        vm.newContact = {customFields:{}};
        domServices.modal('contactList-addContactManual', 'close');
        vm.modalErrors = {};
        messenger.ok(res.message);
      },
      function (err) {
        vm.modalErrors = err;
        messenger.error(err);
      });
    }

    /**
     * Remove contacts from list by given ids
     * @param ids {number | [{numbers}]}
     */
    function removeContacts(ids) {
      if (!ids) return;
      if (!angular.isArray(ids)) ids = [ids];

      $confirm({ text: "Are you sure, that you want to delete these contact('s')?" }).then(function(){
        vm.lists.deleteContacts(ids).then(
          function(res) {

            if (!res.total) {
              messenger.error(messagesUtil.contactList.noUsersRemoved);
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
      });
    }


    /**
     * Toggle selection for all items in contacts list
     * @param [forceUnselect] {boolean} if true - will not togle, but will turn all off
     */
    function selectAll(forceUnselect) {
      forceUnselect
        ? vm.allSelected = false
        : vm.allSelected = !vm.allSelected;

      if (!vm.lists.activeList || !vm.lists.activeList.members) return;

      for (var i = 0, len = vm.lists.activeList.members.length; i < len ; i++) {
        vm.lists.activeList.members[i]._selected = vm.allSelected && canSelectMember(vm.lists.activeList.members[i]);
      }
    }

    function canSelectMember(member) {
      return !vm.hideStuff || member.canInvite;
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

      vm.lists.parseImportFile(vm.importData.file).then(function(res) {
        domServices.modal('contactList-addContactManual', 'close');
        vm.lists.generateImportPreview(res.data);
        domServices.modal('modals-import-preview');
        processImportData(res);
      }, function(err) {
        messenger.error(messagesUtil.contactList.import.failed);
        vm.importErrorMessage = messagesUtil.contactList.import.corrupted;
      });
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
      vm.currentContactListData = res.data;

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

      processMappingFields();
    }

    // Drag and drop fields section
    function onFieldMapDrop(dataSource, dataTarget) {
      if (dataSource.field) {
        var dataTargetValue = dataTarget.field;
        dataTarget.field = dataSource.field;
        dataSource.field = dataTargetValue;
      } else {
        dataTarget.field = dataSource;
      }
    }

    function processMappingListSegment(list) {
      var userList = [];
      for (var j = 0; j < list.length; j++ ) {
        var user = {};
        for (var i = 0; i < vm.contactListDropItems.customFields.length; i++) {
          if (vm.contactListDropItems.customFields[i].field) {
            user[vm.contactListDropItems.customFields[i].name] = list[j][vm.contactListDropItems.customFields[i].field];
          }
        }//for

        for (var i = 0; i < vm.contactListDropItems.defaultFields.length; i++) {
          if (vm.contactListDropItems.defaultFields[i].field) {
            user[vm.contactListDropItems.defaultFields[i].name] = list[j][vm.contactListDropItems.defaultFields[i].field];
          }
        }//for

        user.rowNr = list[j].rowNr;
        user.validationErrors = list[j].validationErrors;
        userList.push(user);
      }//for
      return userList;
    }

    function prepareOutputObject() {
      var output = {valid:[], invalid:[], duplicateEntries: []};
      vm.contactListToAdd = processMappingListSegment(vm.currentContactListData.valid);
      output.valid = vm.contactListToAdd;
      output.invalid = processMappingListSegment(vm.currentContactListData.invalid);
      output.duplicateEntries = processMappingListSegment(vm.currentContactListData.duplicateEntries);
      return output;
    }

    function processMappingFields() {
      var output = prepareOutputObject();
      vm.lists.generateImportPreview(output);
    }

    //assigns contact info to mapped fields
    function mappingFieldsContinue() {
      var output = prepareOutputObject();
      var data = vm.currentContactListData;
      //gather processed fields to retest after remaping
      var arrayToTest = output.valid.concat(output.invalid).concat(output.duplicateEntries);
      vm.lists.validateContactImportData(arrayToTest).then(function(res) {
        vm.lists.generateImportPreview(res.result);
      }, function(err) {
        messenger.error(messagesUtil.contactList.import.remapFailed);
      });

      domServices.modal('contactList-addNewListFieldsModal', 'close');
      domServices.modal('modals-import-preview');
    }

    vm.clearDoppedItem = function(item) {
      item.field = null;
    };

    vm.updateCustomFieldList = function() {
      if (vm.newListErrorMessage) return;

      var newList = angular.copy(vm.newList);
      newList.name = vm.name;
      if (!newList.name) {
        dbg.log2('#ContactListController > updateList > error > list name is empty');
        messenger.error(messagesUtil.contactList.listNameBlank);
        return;
      }

      var parsedList = prepareParsedList(vm.newList);
      updateActiveCustomList(newList, parsedList);
    };

    function reduceFieldList(dest, source) {
      var removeDiffList = [];
      dest.map(function(objDest) {
        source.map(function(objSource) {
          if (objSource.name == objDest.name) {
            objSource.field = objDest.field;
          }
        });
      });
    }

    function updateActiveCustomList(newList, parsedList) {
      vm.lists.updateActiveItem(parsedList).then(
        function (res) {
          messenger.ok(res.message);
          var oldFields = vm.contactListDropItems.customFields;

          prepareCustomFields();
          var newFields = prepareListForMapping(vm.lists.activeList.customFields);
          reduceFieldList(oldFields, newFields);
          vm.contactListDropItems.customFields = newFields;
        },
        function (err) {
          messenger.error(err);
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
      newList.name = vm.name;
      if(canAddMoreFields()) {
        if(vm.additionalMappingFieldname) {
          parsedList.customFields.push(vm.additionalMappingFieldname);
          vm.additionalMappingFieldname = "";
          updateActiveCustomList(newList, parsedList);
        }else{
          messenger.error(messagesUtil.contactList.addCustomFieldName);
        }
      }else{
        messenger.error(messagesUtil.contactList.tooManyCustomFields + vm.lists.activeList.maxCustomFields);
      }
    };

    function canAddMoreFields() {
      var parsedList = prepareParsedList(vm.newList);
      if (vm.lists.activeList) {
        return parsedList.customFields.length < vm.lists.activeList.maxCustomFields;
      } else {
        return false;
      }
    }

    function addImportedContacts() {

      if (!vm.lists.importPreviewArray.length) return;

      vm.lists.addImportedContacts().then(
        function(res) {
          domServices.modal('modals-import-preview', 'close');
          messenger.ok(res.message);
        },
        function(err) {

          messenger.error(messagesUtil.contactList.import.failed);
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

    vm.getPreviewFields = function() {
      if(vm.lists.activeList) {
        return vm.lists.activeList.defaultFields.concat(vm.lists.activeList.customFields);
      }
      else {
        return [];
      }
    }

    function isObserverListSelected() {
      return vm.lists.activeListIndex == findIndexByListName(observersListName);
    }

    function findIndexByListName(listName) {
      if (!vm.lists.items) {
        return 0;
      }
      for (var i = 0; i < vm.lists.items.length; i++) {
        if (vm.lists.items[i].name === listName) {
          return i;
        }
      }
    }

    function prepareCurrentPageComments() {
      if (vm.showContactComments.comments.length > 0) {
        vm.showContactComments.pagination.items =  vm.showContactComments.comments.slice((vm.showContactComments.pagination.currentPage - 1) * vm.showContactComments.pagination.itemsPerPage, 
          vm.showContactComments.pagination.currentPage * vm.showContactComments.pagination.itemsPerPage);
      } else {
        vm.showContactComments.pagination.items = {};
      }
    }

    function showContactCommentsModal(member) {
      vm.showContactComments.contact = member;
      vm.showContactComments.pagination.currentPage = 1;
      vm.lists.getContactComments(member.id).then(
        function (res) {
          vm.showContactComments.comments = res;
          vm.showContactComments.pagination.totalItems = res.length;
          prepareCurrentPageComments();
          domServices.modal('contactCommentsModal');
        },
        function (err) {
          messenger.error(err);
        }
      );
    }

  }
})();
