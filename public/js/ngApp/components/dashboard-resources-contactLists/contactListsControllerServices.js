(function () {
  'use strict';

  angular.module('KliikoApp').factory('contactListsControllerServices', contactListsControllerServicesFactory);

  contactListsControllerServicesFactory.$inject = ['$q', 'dbg', 'contactListServices', '$filter', 'CustomTableModel', 'ListMemberModel'];
  function contactListsControllerServicesFactory($q, dbg, contactListServices, $filter, Table, Member)  {
    var lists = [];
    var activeListIndex,
        selectedListMembers,
        listCustomFields;

    var publicServices = {};

    publicServices.getContactLists = getContactLists;
    publicServices.currentListIndex = currentListIndex;
    publicServices.getListMembers = getListMembers;
    publicServices.addNewList = addNewList;
    publicServices.updateList = updateList;
    publicServices.getListCustomFields = getListCustomFields;

    return publicServices;


    function getContactLists() {
      var deferred = $q.defer();


      contactListServices.getContactLists().then(function (result) {
        // get lists array
        lists = $filter('orderBy')(result, 'id');

        if (lists.length) {
          for (var i = 0, len = lists.length; i < len ; i++) {
            if (lists[i].members && lists[i].members.length) {
              lists[i].Members = [];
              for (var j = 0, len2 = lists[i].members.length; j < len2 ; j++) {
                lists[i].Members.push( new Member( lists[i].members[j] ) );
              }

              if (activeListIndex == i) {
                selectedListMembers = lists[i].Members;
              }

            }
          }

          // show members of active list (first one if it is init case)

          //selectedListMembers = lists[activeListIndex].members;

          // prepare tables with different custom fields for every list we recieved
          for (var i = 0, len = lists.length; i < len ; i++) {
            lists[i].table = new Table( {id:lists[i].id} );

            var availableTables = lists[i].defaultFields.concat( lists[i].customFields );
            lists[i].table.availableTables(availableTables);
          }

          // add row controls for members (if any) in active list
          prepareSelectedList();

          deferred.resolve(lists);

        }
      });

      return deferred.promise;
    }


    /**
     * Add "controls": selected or not
     * and CustomFieldObject to members items
     */
    function prepareSelectedList() {
      if (selectedListMembers) {
        for (var i = 0, len = selectedListMembers.length; i < len ; i++) {
          selectedListMembers[i].CustomFieldsObject = selectedListMembers[i].data.customFields || [];
          if (!selectedListMembers[i].selected) selectedListMembers[i].selected = false;
        }
      }

      if (lists[activeListIndex].customFields) listCustomFields = lists[activeListIndex].customFields;
    }

    /**
     * Get/Set current list index (position in lists array)
     * @param [index] {number}
     * @returns {*}
     */
    function currentListIndex(index) {
      if (typeof index == 'undefined') return activeListIndex;
      return activeListIndex = index;
    }

    function getListMembers() {
      var members = lists[activeListIndex].Members;

      if (members && members.length) {
        for (var i = 0, len = members.length; i < len ; i++) {

          members[i].customFields = members[i].customFields || [];
          if (!members[i].selected) members[i].selected = false;

          members[i].name = members[i].firstName + ' ' + members[i].lastName;
        }
      }

      if (lists[activeListIndex].customFields) listCustomFields = lists[activeListIndex].customFields;

      return members;

    }

    function addNewList(newList) {
      var deferred = $q.defer();
      contactListServices.submitNewList(newList).then(
        function(res) {
          dbg.log('#ContactListController > submitNewList > success: New List "'+ res.name + '" added');
          res.table = new Table({id:res.id});

          var availableTables = res.defaultFields.concat( res.customFields );
          res.table.availableTables(availableTables);

          deferred.resolve(res);
        },
        function(err) {
          dbg.error('#ContactListController > submitNewList > error: ', err);
          deferred.reject(err);
        }
      );

      return deferred.promise;

    }

    function updateList(listId, newList) {
      var deferred = $q.defer();
      contactListServices.updateList(listId, newList).then(
        function(res) {
          dbg.log('#ContactListController > updateList > success: List "'+ newList.name + '" updated');

          // update list name
          lists[activeListIndex].name = newList.name;
          delete newList.name;

          // populate list with all new custom fields
          lists[activeListIndex].customFields = [];
          for (var key in newList) {
            lists[activeListIndex].customFields.push(newList[key]);
          }

          //vm.newList = {};


          // to update members with new custom fields (if any)
          prepareSelectedList();

          lists[activeListIndex].table = new Table({id:lists[activeListIndex].id });
          var availableTables = lists[activeListIndex].defaultFields.concat( lists[activeListIndex].customFields );
          lists[activeListIndex].table.availableTables(availableTables);

          deferred.resolve(lists[activeListIndex]);
        },
        function(err) {
          dbg.error('#ContactListController > updateList > error: ', err);
          deferred.reject(err);
        }
      );
      return deferred.promise;
    }

    function getListCustomFields() {
      if (lists[activeListIndex].customFields) return listCustomFields = lists[activeListIndex].customFields;
      return [];
    }



  }
})();
