(function () {
  'use strict';

  /**
   * Table, that can have dynamics rows
   */
  angular.module('KliikoApp').factory('ListsModel', ListsModel);

  ListsModel.$inject = ['$q', 'contactListServices', 'ListItemModel', '$filter'];
  function ListsModel($q, contactListServices, ListItemModel, $filter)  {
    var ListsModel;

    ListsModel = ListsModel;
    ListsModel.prototype.init = init;
    ListsModel.prototype.getAll = getAll;
    ListsModel.prototype.changeActiveList = changeActiveList;
    ListsModel.prototype.addNew = addNewListItem;
    ListsModel.prototype.updateActiveItem = updateActiveItem;
    ListsModel.prototype.delete = deleteItem;

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
          for (var i = 0, len = res.length; i < len ; i++) {
            var resItem = new ListItemModel(res[i]);

            self.items.push(resItem);
          }
          self.items = $filter('orderBy')(self.items, 'id');
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

    function updateActiveItem(updateFieldsObj) {
      var deferred = $q.defer();

      var self = this;
      var currentIndex = self.activeListIndex;

      var updateFieldsObj = updateFieldsObj;

      self.activeList.update(updateFieldsObj).then(
        function (res) {
          //debugger; //debugger
          // rewrite name
          self.activeList.name = updateFieldsObj.name;
          delete updateFieldsObj.name;

          // rewrite custom fields
          self.activeList.customFields = [];
          for (var key in  updateFieldsObj) {
            self.activeList.customFields.push( updateFieldsObj[key] );
          }


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




  }
})();
