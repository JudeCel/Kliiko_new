(function () {
  'use strict';
  angular.module('KliikoApp').factory('ChatSessionsServices', ChatSessionsServices);
  ChatSessionsServices.$inject = ['globalSettings', '$q', '$resource', 'dbg'];

  function ChatSessionsServices(globalSettings, $q, $resource, dbg) {
    var chatSessionApi = $resource(globalSettings.restUrl + '/sessions/:path', null, {
      copy: { method: 'POST', params: { path: 'copy' } }
    });

    var csServices = {};

    csServices.getChatSessions = getChatSessions;
    csServices.deleteSession = deleteSession;
    csServices.copySession = copySession

    return csServices;

    function getChatSessions() {
      var deferred = $q.defer();

      dbg.log2('#ChatSessions > getChatSessions > make rest call');
      chatSessionApi.get({}, function(res) {
        dbg.log2('#ChatSessions > get > rest call responds');
        deferred.resolve(res);
      });
      
      return deferred.promise;
    };

    function deleteSession(sessionId) {
      var deferred = $q.defer();

      dbg.log2('#ChatSessions > deleteSession > make rest call');
      console.log(sessionId)
      chatSessionApi.delete({sessionId: sessionId}, function(res) {
        dbg.log2('#ChatSessions > deleteSession > rest call responds');
        deferred.resolve(res);
      });
      
      return deferred.promise;
    }

    function copySession(sessionId) {
      var deferred = $q.defer();

      dbg.log2('#ChatSessions > copySession > make rest call');
      chatSessionApi.copy({sessionId: sessionId}, function(res) {
        dbg.log2('#ChatSessions > copySession > rest call responds');
        deferred.resolve(res);
      });
      
      return deferred.promise;
    }

  };
})();
