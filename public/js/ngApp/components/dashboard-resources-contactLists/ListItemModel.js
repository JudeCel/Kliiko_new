(function () {
  'use strict';

  /**
   * Table, that can have dynamics rows
   */
  angular.module('KliikoApp').factory('ListItemModel', ListItemModel);

  ListItemModel.$inject = ['$q', 'contactListServices', 'Upload', 'globalSettings'];
  function ListItemModel($q, contactListServices, Upload, globalSettings)  {
    var ListItemModel;

    ListItemModel = ListItemModel;
    ListItemModel.prototype.init = init;
    ListItemModel.prototype.update = update;
    ListItemModel.prototype.availableTables = availableTables;

    ListItemModel.prototype.updateAvailableTables = updateAvailableFields;
    ListItemModel.prototype.updateAvailableFields = updateAvailableFields;

    ListItemModel.prototype.toggleTableToShow = toggleTableToShow;
    ListItemModel.prototype.updateTableSortingByDragging = updateTableSortingByDragging;

    ListItemModel.prototype.parseImportFile = parseImportFile;

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

      self.availableTablesArray = [];

      self.init();

    }

    function init() {
      var self = this;

      var allAvailableFields = [];
      allAvailableFields = allAvailableFields.concat(self.defaultFields, self.customFields);

      self.availableTablesArray = allAvailableFields;

    }

    function update(newItemObject) {
      var deferred = $q.defer();
      var self = this;

      contactListServices.updateList(self.id, newItemObject).then(
        function (res) {
          deferred.resolve(res);
        },
        function (err) {
          deferred.reject(err);
        }
      );
      return deferred.promise;
    }

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

        return self.availableTablesArray = tablesArray;

      }


    }

    function updateAvailableFields() {
      var self = this;
      self.init();
    }


    function toggleTableToShow(column) {
      var self = this;

      self.visibleFields.indexOf(column) > -1
        ? self.visibleFields.splice( self.visibleFields.indexOf(column), 1)
        : self.visibleFields.push(column);

      self.update(self);

    }

    function updateTableSortingByDragging(graggedIndex, droppedIndex) {
      var self = this;

      var dragged = self.visibleFields[graggedIndex];
      var dropped = self.visibleFields[droppedIndex];

      self.visibleFields[droppedIndex] = dragged;
      self.visibleFields[graggedIndex] = dropped;

      self.update(self);
    }

    /**
     * Parse and validate given import file (excel, csv) on back end
     * @param file {File}
     * @returns {*|promise}
     */
    function parseImportFile(file) {
      var self = this;

      var deferred = $q.defer();

      Upload.upload({
        url: globalSettings.restUrl+'/contactLists/'+self.id+'/import',
        method: 'POST',
        data: {uploadedfile: file}
      }).then(function (res) {

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

  }
})();
