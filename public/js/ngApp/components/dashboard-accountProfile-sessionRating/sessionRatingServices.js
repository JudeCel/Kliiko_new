(function () {
  'use strict';
  angular.module('KliikoApp').factory('SessionRatingServices', SessionRatingServices);
  SessionRatingServices.$inject = ['globalSettings', '$q', '$resource', 'dbg'];

  function SessionRatingServices(globalSettings, $q, $resource, dbg) {
    var sessionListApi = $resource(globalSettings.restUrl + '/session/:id', null, {
      ratingList: { method: 'get', params: { id: 'ratingList' } }
    });

    var csServices = {};
    csServices.findAllSessions = findAllSessions;
    return csServices;

    function findAllSessions() {
      var deferred = $q.defer();

      dbg.log2('#ChatSessions > findAllSessions > make rest call');
      sessionListApi.ratingList({}, function(res) {
        dbg.log2('#ChatSessions > get > rest call responds');
        deferred.resolve(res);
      });

      return deferred.promise;
    };

  };
})();
