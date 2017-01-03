(function () {
  'use strict';

  angular.module('KliikoApp.goToChatroom', []).factory('goToChatroom', goToChatroomFactory);

  goToChatroomFactory.$inject = ['$q', 'authResource', '$http', 'globalSettings', 'messenger'];
  function goToChatroomFactory($q, authResource, $http, globalSettings, messenger) {
    var jwtTokenForMemberApi = authResource('/jwtTokenForMember');

    var blankWindow;
    var goToChatroomService = {};
    goToChatroomService.go = go;
    goToChatroomService.generateRedirectLink = generateRedirectLink;
    return goToChatroomService;

    function go(sessionId) {
      var deferred = $q.defer();

      generateRedirectLink(sessionId).then(function(url) {
        window.open(url, '_self');
      }, function(error) {
        messenger.error(error);
        deferred.resolve(error);
      });

      return deferred.promise;
    }

    function generateRedirectLink(sessionId) {
      var deferred = $q.defer();
      jwtTokenForMemberApi.get({ sessionId: sessionId, callback_url: window.location.href, chatUrl: globalSettings.serverChatDomainUrl }, function(res) {
        if(res.error) {
          deferred.reject(res.error);
        } else if (res.errors) {
          deferred.reject(res.errors.permissions);
        }
        else {
          deferred.resolve(res.redirect_url);
        }
      });
      return deferred.promise;
    }
  }
})();
