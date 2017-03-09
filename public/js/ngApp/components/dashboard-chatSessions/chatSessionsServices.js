(function () {
  'use strict';
  angular.module('KliikoApp').factory('chatSessionsServices', chatSessionsServices);
  chatSessionsServices.$inject = ['$q', '$resource', 'dbg'];

  function chatSessionsServices($q, $resource, dbg) {
    var chatSessionApi = $resource('/session/:id', null, {
      get: { method: 'get', params: { id: 'list' } },
      copy: { method: 'post', params: { id: '@id' } },
      remove: { method: 'delete', params: { id: '@id' } },
      put: { method: 'put', params: { id: '@id' } }
    });

   var sessionMemberApi = $resource('/sessionMember/:path/:id', null, {
      comment: { method: 'post', params: { id: '@id', path: 'comment' } },
      rate: { method: 'post', params: { id: '@id', path: 'rate' } }
    });

    var csServices = {};
    csServices.findAllSessions = findAllSessions;
    csServices.removeSession = removeSession;
    csServices.copySession = copySession;
    csServices.setOpen = setOpen;
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
      chatSessionApi.remove(data, function(res) {
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

    function setOpen(sessionId, open) {
      var deferred = $q.defer();

      dbg.log2('#ChatSessions > setOpen > make rest call');
      chatSessionApi.put({id: sessionId, open: open}, function(res) {
        dbg.log2('#ChatSessions > setOpen > rest call responds');
        deferred.resolve(res);
      });

      return deferred.promise;
    }

  };
})();
