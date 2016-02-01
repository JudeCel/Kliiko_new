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

    vm.addNewList = addNewList;
    vm.submitNewList = submitNewList;
    vm.updateList = updateList;
    vm.deleteList = deleteList;
    vm.editCustomFields = editCustomFields;


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

      if (vm.listIdToEdit) {
        updateList();
        return
      }

      if (!vm.newList.name) {
        dbg.log2('#ContactListController > submitNewList > error > list name is empty');
        messenger.error('List Name can not be blank');
        return;
      }

      vm.lists.addNew(vm.newList).then(
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

      vm.lists.updateActiveItem(vm.newList).then(
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



  }
})();
