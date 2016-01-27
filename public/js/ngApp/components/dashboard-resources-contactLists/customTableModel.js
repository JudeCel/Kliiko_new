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
    TM.prototype.availableTables = availableTables;
    TM.prototype.tablesToShow = tablesToShow;
    TM.prototype.toggleTableToShow = toggleTableToShow;


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

      self.availableTablesArray = [];
      if (!self.predefinedTables) self.predefinedTables = predefinedTables;
      if (!self.tablesToShowArray) self.tablesToShowArray = predefinedTables;

      // restore or save table settings
      localStorage['tableData'+self.id]
       ? self.tablesToShow( JSON.parse(localStorage['tableData'+self.id] ) )
       : localStorage['tableData'+self.id] = JSON.stringify( self.tablesToShow() );
    }

    /**
     * Get / Set tables that can be used
     * @param [tablesArray] {array} - example: ['name', 'email', 'mobile', 'gender']
     * @returns {array}
     */
    function availableTables(tablesArray) {
      var self = this;

      if ( typeof(tablesArray) == 'undefined' ) { return getter() } else { return setter() }

      function getter() {
        return self.availableTablesArray;
      }

      function setter() {
        if ( !angular.isArray(tablesArray) ) {
          console.warn('Expected array in params', tablesArray);
          return;
        }

        return self.availableTablesArray = tablesArray

      }
    }

    /**
     * Get / Set tables to show
     * @param [tablesArray] {array} - example: ['name', 'email', 'mobile', 'gender']
     * @returns {array}
     */
    function tablesToShow(tablesArray) {
      var self = this;

      if ( typeof(tablesArray) == 'undefined' ) { return getter() } else { return setter() }

      function getter() {
        return self.tablesToShowArray;
      }

      function setter() {
        if ( !angular.isArray(tablesArray) ) {
          console.warn('Expected array in params', tablesArray);
          return;
        }
        self.tablesToShowArray = tablesArray;

        localStorage['tableData'+self.id] = JSON.stringify( self.tablesToShow() );

        return  self.tablesToShowArray;

      }

    }

    /**
     * Toggle (add / remove) table by name in tablesToShowArray
     * @param tableName {string}
     */
    function toggleTableToShow(tableName) {
      var self = this;

      if ( self.tablesToShowArray.indexOf(tableName) > -1 ) {
        self.tablesToShowArray.splice( self.tablesToShowArray.indexOf(tableName), 1 );
        localStorage['tableData'+self.id] = JSON.stringify( self.tablesToShow() );
        return;
      }

      self.tablesToShowArray.push(tableName);
      localStorage['tableData'+self.id] = JSON.stringify( self.tablesToShow() );
    }





  }
})();
