(function () {
  'use strict';
  angular.module('KliikoApp').controller('ContactListController', ContactListController);

  ContactListController.$inject = ['domServices','contactListsControllerServices','contactListServices', 'dbg', 'messenger', '$filter', 'ListMemberModel'];
  function ContactListController(domServices, cls, contactListServices, dbg, messenger, $filter, Member) {
    dbg.log2('#ContactListController  started');
    var vm =  this;


    vm.lists = [];
    vm.activeListIndex = null;
    vm.selectedListMembers = [];
    vm.newContact = {customFields:{}};
    vm.modContentBlock= {generalDetails:true, history: false};
    vm.newList = {};
    vm.modalErrors = {};
    vm.allSelected = false;
    vm.tableSort = {by: null, reverse: false};
    vm.listCustomFields = [];
    vm.listUpdate = null;

    vm.listItemClickHandle = listItemClickHandle;
    vm.changeTableSortingFilter = changeTableSortingFilter;
    vm.showManageColumnsModal = showManageColumnsModal;

    vm.contactAddEditClickHandle = contactAddEditClickHandle;
    vm.createContact = createContact;
    vm.updateContact = updateContact;
    vm.removeContacts = removeContacts;

    vm.selectAll = selectAll;
    vm.massDelete = massDelete;

    vm.addNewList = addNewList;
    vm.editCustomFields = editCustomFields;
    vm.checkCustomFields = checkCustomFields;
    vm.submitNewList = submitNewList;
    vm.removeList = removeList;


    init();

    /**
     * Fetch lists and show first list details
     */
    function init() {
      vm.activeListIndex = 0;
      cls.currentListIndex(vm.activeListIndex);
      cls.getContactLists().then(function(res) {
        vm.lists = res;

        listItemClickHandle(vm.activeListIndex);
      });

      ///////
      //contactListServices.getContactLists().then(function (result) {
      //  vm.lists = $filter('orderBy')(result, 'id');
      //  if (vm.lists.length) {
      //    // show first list content
      //    vm.activeListIndex = 0;
      //    vm.selectedListMembers = vm.lists[vm.activeListIndex].members;
      //
      //
      //    prepareSelectedList();
      //  }
      //});
    }


    /**
     * Add "controls" to members items
     */
    function prepareSelectedList() {
      if (vm.selectedListMembers) {
        for (var i = 0, len = vm.selectedListMembers.length; i < len ; i++) {
          vm.selectedListMembers[i].customFields = vm.selectedListMembers[i].customFields || [];
          if (!vm.selectedListMembers[i].selected) vm.selectedListMembers[i].selected = false;
        }
      }

      if (vm.lists[vm.activeListIndex].customFields) vm.listCustomFields = vm.lists[vm.activeListIndex].customFields;
    }

    /**
     * Go to selected list
     * @param index {number} - index in vm.lists array
     */
    function listItemClickHandle(index){
      vm.activeListIndex = cls.currentListIndex(index);
      vm.selectedListMembers = cls.getListMembers();
      vm.listCustomFields = cls.getListCustomFields();
      //vm.selectedListMembers = vm.lists[vm.activeListIndex].members;
      //
      //prepareSelectedList();
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
      var tablesToShowArray = vm.lists[vm.activeListIndex].table.tablesToShowArray;
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
          prepareSelectedList();

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
     * Update selected user (vm.newContact)
     */
    function updateContact() {
      var currentList = vm.lists[vm.activeListIndex];

      var valid = validateContact();

      if (!valid) return;
      var newContact = angular.copy(vm.newContact);
      newContact.updateFields();
      contactListServices.updateUser(vm.newContact, currentList.id).then(
        function(res) {
          for (var i = 0, len = vm.lists[vm.activeListIndex].length; i < len ; i++) {
            if (vm.lists[vm.activeListIndex].Members[i].id == newContact.id ) {
              vm.lists[vm.activeListIndex].Members[i] = newContact;
              break;
            }
          }

          for (var i = 0, len = vm.selectedListMembers.length; i < len ; i++) {
            if (vm.selectedListMembers[i].id == newContact.id ) {
              vm.selectedListMembers[i] = newContact;
              break;
            }
          }

          domServices.modal('contactList-addContactManual', 'close');
          messenger.ok('Contact '+ newContact.firstName + ' successfully updated');

          vm.newContact = {customFields:{}};


          //prepareSelectedList();

          //for (var i = 0, len = vm.selectedListMembers.length; i < len ; i++) {
          //  if (vm.selectedListMembers[i].CustomFieldsObject && vm.lists[vm.activeListIndex].members) {
          //    for( var key in vm.selectedListMembers[i].CustomFieldsObject ) {
          //      vm.lists[vm.activeListIndex].members[i][key] = vm.selectedListMembers[i].CustomFieldsObject[key];
          //    }
          //  }
          //}

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

    /**
     * Toggle selection for all items in contacts list
     */
    function selectAll() {
      vm.allSelected = !vm.allSelected;
      for (var i = 0, len = vm.selectedListMembers.length; i < len ; i++) {
        vm.selectedListMembers[i]._selected = vm.allSelected;
      }
    }

    /**
     * Delete all contacts that are selected in current list
     */
    function massDelete() {
      var ids = [];
      for (var i = 0, len = vm.selectedListMembers.length; i < len ; i++) {
        if (vm.selectedListMembers[i]._selected === true) ids.push(vm.selectedListMembers[i].id);
      }

      if (!ids.length) return;

      removeContacts(ids);
    }

    /**
     * Open modal and prepare variables
     */
    function addNewList() {
      vm.listUpdate = null;
      vm.modalTab1 = true;
      vm.listModalTitle = 'Add New List';
      domServices.modal('contactList-addNewListModal');
    }

    function editCustomFields() {
      var list = vm.lists[vm.activeListIndex];

      vm.listUpdate = list.id;
      vm.modalTab2 = true;
      vm.listModalTitle = 'Edit List And Custom Fields';

      // populate with existing data
      vm.newList.name = list.name;
      for (var i = 0, len = list.customFields.length; i < len ; i++) {
        var I = i+1;
        vm.newList['customField'+I] = list.customFields[i];
      }

      domServices.modal('contactList-addNewListModal');
    }

    /**
     * Show warning if there is duplicated custom fields names
     * @param number {number} - custom field sequence number from 1 to 12
     */
    function checkCustomFields(number) {
      var value = vm.newList['customField'+number];

      vm.newListErrorMessage = null;
      vm.newListError = {};


      //var allFields = angular.copy(vm.newList);
      //delete allFields['customField'+number];

      var allFields = [];
      var cf = [];
      var df = [];

      for (var key in vm.lists[vm.activeListIndex].customFields) { cf.push(vm.lists[vm.activeListIndex].customFields[key]) }
      for (var key in vm.lists[vm.activeListIndex].defaultFields) { df.push(vm.lists[vm.activeListIndex].defaultFields[key]) }
      allFields = Object.keys(vm.lists[vm.activeListIndex]);
      allFields = allFields.concat(cf, df);


      for (var i = 0, len = allFields.length; i < len ; i++) {
        if (allFields[i] == value) {

          vm.newListError[number] = true;
          vm. newListErrorMessage = 'Name should be unique'
        }
      }


      //for (var key in allFields) {
      //  if (allFields[key] == value) {
      //    vm.newListError[number] = true;
      //    vm. newListErrorMessage = 'Name should be unique'
      //  }
      //}
    }

    /**
     * Add new [or update] contacts List
     */
    function submitNewList() {
      if (vm.newListErrorMessage) return;

      if (vm.listUpdate) {
        updateIt();
        return
      }

      if (!vm.newList.name) {
        dbg.log2('#ContactListController > submitNewList > error > list name is empty');
        messenger.error('List Name can not be blank');
        return;
      }

      cls.addNewList(vm.newList).then(
        function(res) {
          dbg.log('#ContactListController > submitNewList > success: New List "'+ res.name + '" added');

          vm.newList = {};
          vm.lists.push(res);

          domServices.modal('contactList-addNewListModal', 'close');
          messenger.ok('New List "'+ res.name + '" added');
          listItemClickHandle(vm.lists.length -1);


        },
        function(err) {
          dbg.error('#ContactListController > submitNewList > error: ', err);
        }
      );

      //contactListServices.submitNewList(vm.newList).then(
      //  function(res) {
      //    dbg.log('#ContactListController > submitNewList > success: New List "'+ res.name + '" added');
      //    vm.newList = {};
      //    vm.lists.push(res);
      //    domServices.modal('contactList-addNewListModal', 'close');
      //    messenger.ok('New List "'+ res.name + '" added');
      //
      //    listItemClickHandle(vm.lists.length -1);
      //  },
      //  function(err) {
      //    dbg.error('#ContactListController > submitNewList > error: ', err);
      //
      //  }
      //);

      function updateIt() {

        cls.updateList(vm.listUpdate, vm.newList).then(
          function(res) {

            dbg.log('#ContactListController > updateList > success: List "'+ vm.newList.name + '" updated');

            // update list name
            vm.lists[vm.activeListIndex] = res;


            vm.newList = {};

            domServices.modal('contactList-addNewListModal', 'close');
            messenger.ok('List "'+ vm.lists[vm.activeListIndex].name + '" updated');

            // to update members with new custom fields (if any)
            prepareSelectedList();

            //if (vm.lists[vm.activeListIndex].members && vm.lists[vm.activeListIndex].members.length) {
            //
            //  var members = vm.lists[vm.activeListIndex].members;
            //  for (var i = 0, len = members.length; i < len ; i++) {
            //    if (members[i].CustomFieldsObject) {
            //      for( var key in members[i].CustomFieldsObject ) {
            //        vm.lists[vm.activeListIndex].members[key] = members[i].CustomFieldsObject[key];
            //      }
            //    }
            //  }
            //}





          },
          function(err) {
            dbg.error('#ContactListController > updateList > error: ', err);
          }
        );

        //contactListServices.updateList(vm.listUpdate, vm.newList).then(
        //  function(res) {
        //    dbg.log('#ContactListController > updateList > success: List "'+ vm.newList.name + '" updated');
        //
        //    // update list name
        //    vm.lists[vm.activeListIndex].name = vm.newList.name;
        //    delete vm.newList.name;
        //
        //    // populate list with all new custom fields
        //    vm.lists[vm.activeListIndex].customFields = [];
        //    for (var key in vm.newList) {
        //      vm.lists[vm.activeListIndex].customFields.push(vm.newList[key]);
        //    }
        //
        //    vm.newList = {};
        //
        //    domServices.modal('contactList-addNewListModal', 'close');
        //    messenger.ok('List "'+ vm.lists[vm.activeListIndex].name + '" updated');
        //
        //    // to update members with new custom fields (if any)
        //    prepareSelectedList();
        //  },
        //  function(err) {
        //    dbg.error('#ContactListController > updateList > error: ', err);
        //  }
        //);
      }
    }

    /**
     * Remove current contact list
     */
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
