(function () {
  'use strict';

  /**
   * Table, that can have dynamics rows
   */
  angular.module('KliikoApp').factory('ListMemberModel', ListMemberModel);

  ListMemberModel.$inject = ['$q'];
  function ListMemberModel($q)  {
    var LM;

    LM = ListMember;
    LM.prototype.getName = getName;
    LM.prototype.updateFields = updateFields;


    return LM;


    /**
     * Init the model
     * @param params {object} where:
     *    params.predefinedTables {array} || predefinedTables - will set default table to show;
     * @constructor
     */
    function ListMember(params) {
      var params = params || {};
      //get all properties
      var self = this;
      for (var p in params) {
        if (params.hasOwnProperty(p)) self[p] = params[p];
      }
      getName(self);
    }

    function getName(self) {
      var self = self || this;
      return self.Name = self.firstName + ' ' + self.lastName;
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
     * Copy CustomFieldsObject to root level of a model
     */
    function updateFields() {
      var self = this;

      if (self.CustomFieldsObject) {
        for (var key in self.CustomFieldsObject ) {
          self[key] = self.CustomFieldsObject[key];
        }
      }

    }





  }
})();
