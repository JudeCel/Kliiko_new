(function () {
  'use strict';

  /**
   * Table, that can have dynamics rows
   */
  angular.module('KliikoApp').factory('ListItemMemberModel', ListItemMemberModel);

  ListItemMemberModel.$inject = ['$q', 'contactListServices'];
  function ListItemMemberModel($q, contactListServices)  {
    var ListItemMemberModel;

    ListItemMemberModel = ListItemMemberModel;
    ListItemMemberModel.prototype.update = update;


    return ListItemMemberModel;


    /**
     * Init the model
     * @param params {object}
     * @param [customFieldsArray] {array}
     *
     * @constructor
     */
    function ListItemMemberModel(params, customFieldsArray) {
      var params = params || {};
      //get all properties
      var self = this;
      for (var p in params) {
        if (params.hasOwnProperty(p)) self[p] = params[p];
      }


      prepareCustomFields();

      /**
       * model should contain
       *  .customFields as array of custom fields keys and
       *  .customFieldsObject as object with keys and values of custom fields
       */
      function prepareCustomFields() {
        // newContactObj comes with customFields object (keys and values), but final outout
        // contact format requires customFields to be an array and it values to be in root level of members(contact) object
        if ( angular.isObject(params.customFields) && !customFieldsArray) {
          for (var key in params.customFields) {
            self[key] = params.customFields[key];
          }
          self.CustomFieldsObject = params.customFields;
          params.customFields = Object.keys(params.customFields);
        }

        if (customFieldsArray) {
          self.customFields = customFieldsArray;
          self.CustomFieldsObject = {};

          for (var i = 0, len = customFieldsArray.length; i < len ; i++) {
            self.CustomFieldsObject[ customFieldsArray[i] ] = self[customFieldsArray[i]];
          }

        }
      }

    }


    function update(listId) {
      var deferred = $q.defer();
      var self = this;

      var currentListId = listId;
      var customFields = self.CustomFieldsObject || {};
      delete self.CustomFieldsObject;

      for (var i = 0, len = customFields.length; i < len ; i++) {
        delete self[ self.customFields[i] ];
      }

      var defaultFields = self;

      var params = {
        customFields: customFields,
        defaultFields: defaultFields
      };

      contactListServices.updateUser(params, currentListId).then(
        function (res) {
          deferred.resolve(res);
        },
        function (err) {
          deferred.reject(err);
        }
      );
      return deferred.promise;

    }





  }
})();
