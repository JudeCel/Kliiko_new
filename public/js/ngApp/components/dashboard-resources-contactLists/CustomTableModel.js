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
    TM.prototype.visibleFields = visibleFields;
    TM.prototype.toggleTableToShow = toggleTableToShow;
    TM.prototype.participantsFields = participantsFields;
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

      if (!self.tablesToShowArray) self.tablesToShowArray = predefinedTables;
    }

    /**
     * Get / Set tables that can be used
     * @param [tablesArray] {array} - example: ['name', 'email', 'mobile', 'gender']
     * @returns {array}
     */
    function availableTables(tablesArray) {
      var self = this;

      if (!self.availableTablesArray) self.availableTablesArray = [];

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

      if (!self.tablesToShowArray) self.tablesToShowArray = [];

      if ( typeof(tablesArray) == 'undefined' ) { return getter() } else { return setter() }

      function getter() {
        return self.tablesToShowArray;
      }

      function setter() {
        if ( !angular.isArray(tablesArray) || tablesArray !== 'int') {
          console.warn('Expected array  or "init" in params', tablesArray);
          return;
        }

        // init case
        if (tablesArray === 'int') return self.tablesToShowArray = self.predefinedTables;

        return  self.tablesToShowArray = tablesArray;

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

    /**
     * Toggle (add / remove) table by name in visibleFields
     * @param tableName {string}
     */
    function visibleFields(visibleFields) {
      var self = this;

      if (!self.visibleFieldsArray) self.visibleFieldsArray = [];

      if (self.visibleFieldsArray.indexOf(visibleFields) > -1 ) {
        self.visibleFieldsArray.splice( self.tablesToShowArray.indexOf(visibleFields), 1 );
        return;
      }



      self.visibleFieldsArray.push(visibleFields);
    }

    /**
     * Get / Set participants fields
     * @param [tablesArray] {array} - example: ['name', 'email', 'mobile', 'gender']
     * @returns {array}
     */
    function participantsFields(participantsFields) {
      var self = this;

      if ( typeof(tablesArray) == 'undefined' ) { return getter() } else { return setter() }

      function getter() {
        return self.participantsFieldsArray;
      }

      function setter() {
        if ( !angular.isArray(participantsFields) ) {
          console.warn('Expected array in params', participantsFields);
          return;
        }
        self.participantsFieldsArray = participantsFields;
        return  self.participantsFieldsArray;
      }

    }

    function init(id, availableFields, participantsFields, visibleFields) {
      var self = this;

      if (!id)  console.error('Can not init model without id');
      self.id = id;

      if (availableFields) self.availableTables(availableTables);
      if (participantsFields) self.participantsFields(participantsFields);
      if (visibleFields) self.tablesToShow(visibleFields);

    }





  }
})();
