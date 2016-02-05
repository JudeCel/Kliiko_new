(function () {
  'use strict';
  angular.module('KliikoApp').factory('chatSessionsServices', chatSessionsServices);
  chatSessionsServices.$inject = ['globalSettings', '$q', '$resource', 'dbg'];

  function chatSessionsServices(globalSettings, $q, $resource, dbg) {
    var chatSessionApi = $resource(globalSettings.restUrl + '/session/:path', null, {
      copy: { method: 'POST', params: { path: 'copy' } }
    });

    var csServices = {};
    csServices.findAllSessions = findAllSessions;
    csServices.removeSession = removeSession;
    csServices.copySession = copySession;
    return csServices;

    function findAllSessions() {
      var deferred = $q.defer();

      dbg.log2('#ChatSessions > findAllSessions > make rest call');
      chatSessionApi.get({}, function(res) {
        dbg.log2('#ChatSessions > get > rest call responds');
        deferred.resolve(res);
      });

      return deferred.promise;
    };

    function removeSession(data) {
      var deferred = $q.defer();

      dbg.log2('#ChatSessions > removeSession > make rest call');
      chatSessionApi.delete(data, function(res) {
        dbg.log2('#ChatSessions > removeSession > rest call responds');
        deferred.resolve(res);
      });

      return deferred.promise;
    }

    function copySession(data) {
      var deferred = $q.defer();

      dbg.log2('#ChatSessions > copySession > make rest call');
      chatSessionApi.copy(data, function(res) {
        dbg.log2('#ChatSessions > copySession > rest call responds');
        deferred.resolve(res);
      });

      return deferred.promise;
    }
  };
})();
