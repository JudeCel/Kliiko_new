(function () {
  'use strict';

  /**
   * Table, that can have dynamics rows
   */
  angular.module('KliikoApp').factory('CustomTableModel', CustomTableModel);

  CustomTableModel.$inject = ['$q'];
  function CustomTableModel($q)  {
    var TM;

    TM = TableModel;
    TM.prototype.init = init;

    return TM;


    /**
     * Init the model
     * @param params {object} where:
     *    params.predefinedTables {array} || predefinedTables - will set default table to show;
     * @constructor
     */
    function TableModel(params) {
      var params = params || {};
      //get all properties
      var self = this;
      for (var p in params) {
        if (params.hasOwnProperty(p)) self[p] = params[p];
      }

      var predefinedTables = ['Name', 'email', 'mobile', 'gender'];
      if (!self.predefinedTables) self.predefinedTables = predefinedTables;

      if (!self.tablesToShowArray) self.tablesToShowArray = self.visibleFields || predefinedTables;
    }


    function init() {

    }



  }
})();
