(function () {
  'use strict';

  angular.module('KliikoApp.goToChatroom', []).factory('goToChatroom', goToChatroomFactory);

  goToChatroomFactory.$inject = ['$q', '$resource', '$http', 'globalSettings', 'messenger'];
  function goToChatroomFactory($q, $resource, $http, globalSettings, messenger) {
    var jwtTokenForMemberApi = $resource(globalSettings.restUrl + '/jwtTokenForMember');

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

      jwtTokenForMemberApi.get({ sessionId: sessionId }, function(res) {
        if(res.error) {
          deferred.reject(res.error);
        }
        else {
          $http({
            method: 'GET',
            url: globalSettings.serverChatDomainUrl + '/api/auth/token/',
            headers: { 'Authorization': res.token }
          }).then(function(response) {
            deferred.resolve(response.data.redirect_url);
          }, function(response) {
            deferred.reject(response.data.errors.permissions);
          });
        }
      });

      return deferred.promise;
    }
  }
})();
