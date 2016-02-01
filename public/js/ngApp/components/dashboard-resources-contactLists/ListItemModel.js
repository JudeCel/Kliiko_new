(function () {
  'use strict';

  /**
   * Table, that can have dynamics rows
   */
  angular.module('KliikoApp').factory('ListItemModel', ListItemModel);

  ListItemModel.$inject = ['$q', 'contactListServices'];
  function ListItemModel($q, contactListServices)  {
    var ListItemModel;

    ListItemModel = ListItemModel;
    ListItemModel.prototype.update = update;
    return ListItemModel;


    /**
     * Init the model
     * @param params {object} where:
     *    params.predefinedTables {array} || predefinedTables - will set default table to show;
     * @constructor
     */
    function ListItemModel(params) {
      var params = params || {};
      //get all properties
      var self = this;
      for (var p in params) {
        if (params.hasOwnProperty(p)) self[p] = params[p];
      }

    }

    function update(newItemObject) {
      var deferred = $q.defer();
      var self = this;

      contactListServices.updateList(self.id, newItemObject).then(
        function (res) {
          deferred.resolve(res);
          console.warn(res);
        },
        function (err) {
          deferred.reject(err);
        }
      );
      return deferred.promise;
    }

  }
})();
