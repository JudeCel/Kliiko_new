(function () {
  'use strict';
  angular.module('KliikoApp').factory('ChatSessionsServices', ChatSessionsServices);
  ChatSessionsServices.$inject = ['globalSettings', '$q', '$resource', 'dbg'];

  function ChatSessionsServices(globalSettings, $q, $resource, dbg) {
    var galleryRestApi = $resource(globalSettings.restUrl + '/chatSessions/:path', null, {

    });

    var upServices = {};

    upServices.getChatSessions = getChatSessions;

    return upServices;

    function getChatSessions() {
      var deferred = $q.defer();

      dbg.log2('#ChatSessions > get > make rest call');
      galleryRestApi.get({}, function(res) {
        dbg.log2('#ChatSessions > get > rest call responds');
        deferred.resolve(res);
      });
      
      return deferred.promise;
    };

  };
})();
