(function () {
  'use strict';
  angular.module('KliikoApp').factory('SessionRatingServices', SessionRatingServices);
  SessionRatingServices.$inject = ['$q', 'authResource', 'dbg'];

  function SessionRatingServices($q, authResource, dbg) {
    var sessionListApi = authResource('/session/ratings', null);

    var csServices = {};
    csServices.findAllSessions = findAllSessions;
    return csServices;

    function findAllSessions() {
      var deferred = $q.defer();

      dbg.log2('#ChatSessions > findAllSessions > make rest call');
      sessionListApi.get({}, function(res) {
        dbg.log2('#ChatSessions > get > rest call responds');
        deferred.resolve(res);
      });

      return deferred.promise;
    };

  };
})();
