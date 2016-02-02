(function () {
  'use strict';

  /**
   * Table, that can have dynamics rows
   */
  angular.module('KliikoApp').factory('ListsModel', ListsModel);

  ListsModel.$inject = ['$q', 'contactListServices', 'ListItemModel', '$filter', 'ListItemMemberModel'];
  function ListsModel($q, contactListServices, ListItemModel, $filter, Member)  {
    var ListsModel;

    ListsModel = ListsModel;
    ListsModel.prototype.init = init;
    ListsModel.prototype.getAll = getAll;
    ListsModel.prototype.changeActiveList = changeActiveList;
    ListsModel.prototype.addNew = addNewListItem;
    ListsModel.prototype.updateActiveItem = updateActiveItem;
    ListsModel.prototype.delete = deleteItem;

    ListsModel.prototype.addNewContact = addNewContact;
    ListsModel.prototype.updateContact = updateContact;
    ListsModel.prototype.deleteContacts = deleteContacts;

    return ListsModel;


    /**
     * Init the model
     * @param params {object} where:
     *    params.predefinedTables {array} || predefinedTables - will set default table to show;
     * @constructor
     */
    function ListsModel(params) {
      var params = params || {};
      //get all properties
      var self = this;
      for (var p in params) {
        if (params.hasOwnProperty(p)) self[p] = params[p];
      }

      self.items = [];
      self.activeList = null;
      self.activeListIndex = null;

      self.init();

    }

    /**
     * Fetch all lists and set first one as active
     */
    function init() {
      var self = this;
      self.getAll().then(
        function (res) {
          self.changeActiveList(0);
        },
        function (err) {
          console.error('Something wrong in ListsModel Initing');
        }
      );

    }

    /**
     * Get all lists, store them as ListItemModel and sort by 'id'
     */
    function getAll() {
      var deferred = $q.defer();


      var self = this;

      contactListServices.getContactLists().then(
        function(res) {
          // prepare itmes
          for (var i = 0, len = res.length; i < len ; i++) {
            var resItem = new ListItemModel(res[i]);

            self.items.push(resItem);
          }
          self.items = $filter('orderBy')(self.items, 'id');

          //prepare members
          for (var i = 0, len = self.items.length; i < len ; i++) {
            if ( self.items[i].members && self.items[i].members.length) {
              var membersRaw = self.items[i].members;
              self.items[i].members = [];

              for (var j = 0, lenj = membersRaw.length; j < lenj ; j++) {
                var newMember = new Member(membersRaw[j], self.items[i].customFields);
                self.items[i].members.push(newMember);
              }

            }
          }
          deferred.resolve();
        },
        function(err) { deferred.reject(err) }
      );

      return deferred.promise;
    }

    function changeActiveList(index) {
      var self = this;

      if ( typeof(index) == 'undefined' || index < 0 ) var index = 0;

      if (self.activeListIndex == index) return;


      self.activeListIndex = index;
      self.activeList = self.items[index];
    }

    function addNewListItem(newListItemObj) {
      var deferred = $q.defer();
      var self = this;

      contactListServices.submitNewList(newListItemObj).then(
        function (res) {
          var newList = new ListItemModel(res);
          self.items.push( newList );
          deferred.resolve(newList);
        },
        function (err) {
          deferred.reject(err);
        }
      );

      return deferred.promise;

    }

    /**
     * Update list item instance ( ListItemModel.update() ) and then update lists model items with this updated instance
     * @param updateFieldsObj
     * @returns {*}
     */
    function updateActiveItem(updateFieldsObj) {
      var deferred = $q.defer();

      var self = this;
      var currentIndex = self.activeListIndex;

      var updateFieldsObj = updateFieldsObj;

      self.activeList.update(updateFieldsObj).then(
        function (res) {
          // rewrite name
          self.activeList.name = updateFieldsObj.name;
          delete updateFieldsObj.name;

          // rewrite custom fields
          self.activeList.customFields = updateFieldsObj.customFields;
          //self.activeList.customFields = [];
          //for (var key in  updateFieldsObj) {
          //  self.activeList.customFields.push( updateFieldsObj[key] );
          //}
          self.activeList.updateAvailableFields(updateFieldsObj.customFields);
          // update list with the current item
          self.items[currentIndex] = self.activeList;

          deferred.resolve();

        },
        function (err) {
          deferred.reject(err)
        }
      );

      return deferred.promise;
    }

    function deleteItem(item, index) {
      var deferred = $q.defer();
      var self = this;

      if ( typeof(index) != 'undefined' ) var index = index;

      contactListServices.deleteList(item.id).then(
        function (res) {
          if (!index) {
            for (var i = 0, len = self.items.length; i < len ; i++) {
              if (self.items[i].id == item.id) {
                index = i;
                break;
              }
            }
          }

          self.items.splice(index,1);
          deferred.resolve(item);
        },
        function (err) {
          deferred.reject(err);
        }
      );


      return deferred.promise;

    }


    function addNewContact(newContactObj) {
      var self = this;
      var deferred = $q.defer();

      var newContactObj = newContactObj;
      var currentListId = self.activeList.id;

      contactListServices.createUser(newContactObj, currentListId).then(
        function (res) {

          newContactObj = angular.extend(newContactObj, res);

          newContactObj = new Member(newContactObj);



          for (var i = 0, len = self.items.length; i < len ; i++) {
            if (self.items[i].id == currentListId) {

              if (!self.items[i].members) self.items[i].members = [];

              self.items[i].members.push(newContactObj);
              self.items[i].membersCount++;

              break;
            }
          }



          deferred.resolve(res);
        },
        function (err) {
          deferred.reject(err);
        }
      );
      return deferred.promise;
    }

    function updateContact(contact) {
      var deferred = $q.defer();
      var self = this;

      var activeListId = self.activeList.id;

      contact.update(activeListId).then(
        function (res) {

          var updatedContact = new Member(res.data);
          var index;
          for (var i = 0, len = self.items.length; i < len ; i++) {
            if (self.items[i].id == activeListId) {
              index = i;
              break;
            }
          }

          for (var i = 0, len = self.items[index].members.length; i < len ; i++) {
            if (self.items[index].members[i].id == updatedContact.id ) {
              self.items[index].members[i] = updatedContact;
              break;
            }
          }

          deferred.resolve();
        },
        function (err) {
        }
      );
      return deferred.promise;
    }

    function deleteContacts(ids) {
      var self = this;

      var deferred = $q.defer();
      var currentListIndex = self.activeListIndex;
      contactListServices.deleteUser(ids).then(
        function(res) {
          // delete corresponding members
          for (var i = 0, len = ids.length; i < len ; i++) {

            for (var j = 0; j < self.items[currentListIndex].members.length; j++) {
              if (self.items[currentListIndex].members[j].id == ids[i]) {
                self.items[currentListIndex].members.splice( j, 1 );
              }
            }

          }

          //adjust members counter
          self.items[currentListIndex].membersCount = self.items[currentListIndex].membersCount - ids.length;

          deferred.resolve(res);
        },
        function(err) {
          deferred.reject(err)
        }
      );
      return deferred.promise;

    }



  }
})();
