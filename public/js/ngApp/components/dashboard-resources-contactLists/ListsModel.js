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

    ListsModel.prototype.parseImportFile = parseImportFile;
    ListsModel.prototype.generateImportPreview = generateImportPreview;
    ListsModel.prototype.addImportedContacts = addImportedContacts;

    return ListsModel;


    /**
     * Init the model
     * @param params {object}
     *
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

          // make lists by type
          self.listByType = {}
          for (var i = 0, len = self.items.length; i < len ; i++) {
            self.listByType[self.items[i].name] = self.items[i];
          }

          deferred.resolve();
        },
        function(err) { deferred.reject(err) }
      );

      return deferred.promise;
    }

    /**
     * Update active lis with new list by given index in lists array
     * @param index {number} list index in lists array
     * @param [force] {boolean} - rewrite current
     */
    function changeActiveList(index, force) {
      var self = this;

      if ( typeof(index) == 'undefined' || index < 0 ) var index = 0;

      if (self.activeListIndex == index && !force) return;


      self.activeListIndex = index;
      self.activeList = self.items[index];
    }

    /**
     * Add new List item object to lists array and save on remote
     * @param newListItemObj {object}
     * @returns {promise | {newList} }
     */
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
          deferred.reject(err.message);
        }
      );

      return deferred.promise;

    }

    /**
     * Update list item instance ( ListItemModel.update() ) and then update lists model items with this updated instance
     * @param updateFieldsObj {object}
     * @returns {*}
     */
    function updateActiveItem(updateFieldsObj) {
      var deferred = $q.defer();

      var self = this;
      var currentIndex = self.activeListIndex;

      var updateFieldsObj = updateFieldsObj;

      var visibleFields = checkAndGetVisibleFields(updateFieldsObj.customFields);
      updateFieldsObj.visibleFields = visibleFields;

      self.activeList.update(updateFieldsObj).then(
        function (res) {
          // rewrite name
          self.activeList.name = updateFieldsObj.name;
          delete updateFieldsObj.name;

          // rewrite custom fields
          self.activeList.customFields = updateFieldsObj.customFields;
          self.activeList.visibleFields = updateFieldsObj.visibleFields;

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

      function checkAndGetVisibleFields(newCustomFieldsArray) {
        for (var i = 0; i < self.activeList.visibleFields.length;  i++) {
          var inDefaultFields = ( self.activeList.defaultFields.indexOf(self.activeList.visibleFields[i]) > -1);
          var inCustomFields = ( newCustomFieldsArray.indexOf(self.activeList.visibleFields[i]) > -1);

          if (!inDefaultFields && !inCustomFields) {

            self.activeList.visibleFields.splice(i, 1);

          }
        }

        return self.activeList.visibleFields;
      }

    }

    /**
     * Delete given list item and save state on remote
     * @param item {object}
     * @param [index] - index of @item in array (speed up faction with  bypassing for loop)
     * @returns {*|promise}
     */
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

      var activeList = self.activeList;

      contact.update(activeList.id).then(
        function(res) {

          var updatedContact = new Member(res.data, activeList.customFields);
          var index;
          for (var i = 0, len = self.items.length; i < len ; i++) {
            if (self.items[i].id == activeList.id) {
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

          self.changeActiveList(self.activeListIndex, true);
          deferred.resolve(res);
        },
        function (err) {
          deferred.reject(err);
        }
      );
      return deferred.promise;
    }


    /**
     * Delete contact by ids
     * and adjust members amount counter
     * @param ids {array}
     * @returns {*|promise}
     */
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


    /**
     * Parse and validate given import file (excel, csv) on back end
     * @param file {File}
     * @returns {*|promise}
     */
    function parseImportFile(file) {
      var self = this;

      var deferred = $q.defer();

      contactListServices.parseImportFile(file, self.activeList.id).then(function (res) {

        if (res.data && !res.data.result.invalid.length) {
          deferred.resolve({valid: true, data: res.data.result});
        } else {
          deferred.resolve({valid: false, data: res.data.result});

        }

      }, function (err) {
        deferred.reject(err);
      });

      return deferred.promise;

    }

    /**
     * Fill out 3 arrays, that will be reapeated as table:
     * valid, invalid , dublicatedFields
     *
     * @param respData {object}
     */
    function generateImportPreview(respData) {
      var self = this;

      if (!angular.isObject(respData)) {
        dbg.error('#ListItemModel > generateImportPreview > input params expected to be an object ', respData );
        return;
      }

      self.importPreviewArray = [];
      self.importPreviewInvalidArray = [];
      self.importPreviewDublicatesArray = [];

      for (var i = 0, len = respData.valid.length; i < len ; i++) {
        var newContact = new Member(respData.valid[i]);
        self.importPreviewArray.push(newContact);
      }

      for (var i = 0, len = respData.invalid.length; i < len ; i++) {
        var newContact = new Member(respData.invalid[i]);
        self.importPreviewInvalidArray.push(newContact);
      }

      for (var i = 0, len = respData.duplicateEntries.length; i < len ; i++) {
        var newContact = new Member(respData.duplicateEntries[i]);
        self.importPreviewDublicatesArray.push(newContact);
      }

    }

    function addImportedContacts() {
      var self = this;
      var deferred = $q.defer();
      var contactsArray = [];


      for (var i = 0, len = self.importPreviewArray.length; i < len ; i++) {
        var defaultFields = getDefaultFields(self.importPreviewArray[i]);
        var customFields = getCustomFields(self.importPreviewArray[i]);

        contactsArray.push({
          defaultFields: defaultFields,
          customFields: customFields,
          contactListId: self.activeList.id,
          rowNr: self.importPreviewArray[i].rowNr,
        });
      }

      contactListServices.addImportedContacts(contactsArray, self.activeList.id).then(
        function (res) {
          for (var i = 0, len = self.items.length; i < len ; i++) {
            if (self.items[i].id == self.activeList.id) {

              if (!self.items[i].members) self.items[i].members = [];

              self.items[i].members = self.items[i].members.concat(self.importPreviewArray);
              self.items[i].membersCount = + self.items[i].membersCount + self.importPreviewArray.length;

              self.importPreviewArray = null;
              self.changeActiveList(self.activeListIndex, 'force');
              break;
            }
          }

          deferred.resolve(res);
        },
        function(err) {
          if (err.message) {
            deferred.reject(err.message);
          } else {
            deferred.reject(err);
          }

        }
      );
      return deferred.promise;


      function getDefaultFields(contact) {
        var output = {};
        for (var i = 0, len = self.activeList.defaultFields.length; i < len ; i++) {
          output[ self.activeList.defaultFields[i] ] = contact[self.activeList.defaultFields[i] ];
        }
        return output
      }

      function getCustomFields(contact) {
        var output = {};
        for (var i = 0, len = self.activeList.customFields.length; i < len ; i++) {
          output[ self.activeList.customFields[i] ] = contact[self.activeList.customFields[i] ];
        }
        return output
      }


    }



  }
})();
