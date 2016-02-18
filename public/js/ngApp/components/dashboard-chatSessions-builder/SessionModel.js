(function () {
  'use strict';

  /**
   * Table, that can have dynamics rows
   */
  angular.module('KliikoApp').factory('SessionModel', SessionModel);

  SessionModel.$inject = ['$q', 'globalSettings', '$resource'];
  function SessionModel($q, globalSettings, $resource)  {
    var apiPath = globalSettings.restUrl+'/sessionBuilder/:id';
    var sessionBuilderRestApi = $resource(apiPath, {id : '@id'}, {post:{method:'POST', put: {method: 'PUT'}}} );

    var SessionModel;

    SessionModel = SessionModel;
    SessionModel.prototype.init = init;
    SessionModel.prototype.createNew = createNew;
    SessionModel.prototype.getRemoteData = getRemoteData;
    SessionModel.prototype.cancel = cancel;
    SessionModel.prototype.destroy = update;
    SessionModel.prototype.updateStep = updateStep;


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
      if (arguments && arguments.length && arguments.length == 1) {
        self.id = arguments[0];
      } else {
        //get all properties
        for (var p in params) {
          if (params.hasOwnProperty(p)) self[p] = params[p];
        }
      }



      self.init();

    }

    function init() {
      var self = this;

      if (!self.id) self.createNew();
      if (self.id) self.getRemoteData();

    }

    function createNew() {
      var self = this;

      var deferred = $q.defer();
      sessionBuilderRestApi.post({},{},function(res) {
        if (res.error) { deferred.reject(res.error); return deferred.promise; }
        self = angular.merge(self, res.sessionBuilder);
        deferred.resolve(res);
      });

      return deferred.promise;
    }

    function getRemoteData() {
      var self = this;
      var deferred = $q.defer();
      sessionBuilderRestApi.get({id:self.id}, {}, function(res) {
        self = angular.merge(self, res.sessionBuilder);
        deferred.resolve();
      });

      return deferred.promise;
    }

    function cancel() {
      var self = this;
      var deferred = $q.defer();
      debugger; //debugger
      sessionBuilderRestApi.delete({id: self.id},{},function(res) {
        deferred.resolve(res);
      });

      return deferred.promise;
    }

    function update() {
      console.log('will update - todo');
    }

    function updateStep() {
      var self = this;

      console.log(self);
    }





  }
})();
