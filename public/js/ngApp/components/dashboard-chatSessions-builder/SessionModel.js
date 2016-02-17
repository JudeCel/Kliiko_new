(function () {
  'use strict';

  /**
   * Table, that can have dynamics rows
   */
  angular.module('KliikoApp').factory('SessionModel', SessionModel);

  SessionModel.$inject = ['$q'];
  function SessionModel($q)  {
    var SessionModel;

    SessionModel = SessionModel;
    SessionModel.prototype.init = init;
    SessionModel.prototype.destroy = destroy;
    SessionModel.prototype.destroy = update;

    return SessionModel;


    /**
     * Init the model
     * @param params {object}
     *
     * @constructor
     */
    function SessionModel(params) {
      var params = params || {};
      //get all properties
      var self = this;
      for (var p in params) {
        if (params.hasOwnProperty(p)) self[p] = params[p];
      }

      self.id = null;



      self.init();

    }

    function init() {
      var self = this;


    }

    function destroy() {
      console.log('will destroy - todo');
    }

    function update() {
      console.log('will update - todo');
    }





  }
})();
