(function () {
  'use strict';

  /**
   * Table, that can have dynamics rows
   */
  angular.module('KliikoApp').factory('SessionModel', SessionModel);

  SessionModel.$inject = ['$q', 'globalSettings', '$resource'];
  function SessionModel($q, globalSettings, $resource)  {
    var apiPath = globalSettings.restUrl+'/sessionBuilder/';
    var restApi = {
      new: $resource(apiPath +'new'),
      //topic: $resource(globalSettings.restUrl +'/topic/:id', {id:'@id'}, {post: {method: 'POST'}, put: {method: 'PUT'}})
    };


    var SessionModel;

    SessionModel = SessionModel;
    SessionModel.prototype.init = init;
    SessionModel.prototype.createNew = createNew;
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
      var self = this;

      var params = params || {};

      self.id = null;

      //get all properties
      for (var p in params) {
        if (params.hasOwnProperty(p)) self[p] = params[p];
      }

      self.init();

    }

    function init() {
      var self = this;

      if (!self.id) self.createNew();

    }

    function createNew() {
      var self = this;

      var deferred = $q.defer();
      restApi.new.get({},{},function(res) {
        if (res.error) { deferred.reject(res.error); return deferred.promise; }
        var tmp = angular.copy(self);
        console.warn(tmp);
        self = angular.merge(self, res.sessionBuilder);
        console.warn(self);

        deferred.resolve(res);
      });

      return deferred.promise;
    }

    function destroy() {
      console.log('will destroy - todo');
    }

    function update() {
      console.log('will update - todo');
    }





  }
})();
