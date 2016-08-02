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
    goToChatroomService.openBlankWindow = openBlankWindow;
    goToChatroomService.changeUrl = changeUrl;
    goToChatroomService.closeWindow = closeWindow;
    goToChatroomService.getWindow = getWindow;
    return goToChatroomService;

    function go(sessionId) {
      var deferred = $q.defer();

      openBlankWindow();
      generateRedirectLink(sessionId).then(function(url) {
        changeUrl(url);
        deferred.resolve(url);
      }, function(error) {
        closeWindow();
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
            deferred.reject({ error: response.status + ": " + response.statusText });
          });
        }
      });

      return deferred.promise;
    }

    function openBlankWindow() {
      blankWindow = window.open('', '_blank');
      blankWindow.document.write('Loading chatroom...');
    }

    function changeUrl(url) {
      blankWindow.location.href = url;
    }

    function closeWindow() {
      blankWindow.close();
    }

    function getWindow() {
      return blankWindow;
    }
  }
})();
