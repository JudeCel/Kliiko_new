(function () {
  'use strict';
  angular.module('KliikoApp').factory('chatSessionsServices', chatSessionsServices);
  chatSessionsServices.$inject = ['globalSettings', '$q', '$resource', 'dbg', '$http'];

  function chatSessionsServices(globalSettings, $q, $resource, dbg, $http) {
    var chatSessionApi = $resource(globalSettings.restUrl + '/session/:id', null, {
      get: { method: 'get', params: { id: 'list' } },
      copy: { method: 'post', params: { id: '@id' } },
      remove: { method: 'delete', params: { id: '@id' } }
    });

    var sessionMemberApi = $resource(globalSettings.restUrl + '/sessionMember/:path/:id', null, {
      comment: { method: 'post', params: { id: '@id', path: 'comment' } },
      rate: { method: 'post', params: { id: '@id', path: 'rate' } }
    });

    var jwtTokenForMemberApi = $resource(globalSettings.restUrl + '/jwtTokenForMember');


    var csServices = {};
    csServices.findAllSessions = findAllSessions;
    csServices.removeSession = removeSession;
    csServices.copySession = copySession;
    csServices.rateSessionMember = rateSessionMember;
    csServices.prepareError = prepareError;
    csServices.generateRedirectLink = generateRedirectLink;
    csServices.saveComment = saveComment;
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

    function saveComment(member) {
      var deferred = $q.defer();

      dbg.log2('#ChatSessions > saveComment > make rest call');
      sessionMemberApi.comment({ id: member.id }, { comment: member.comment }, function(res) {
        dbg.log2('#ChatSessions > comment > rest call responds');
        deferred.resolve(res);
      });

      return deferred.promise;
    }

    function generateRedirectLink(sessionId) {
      var deferred = $q.defer();

      jwtTokenForMemberApi.get({ sessionId: sessionId }, function(res) {
        console.log(res);
        if(res.error) {
          deferred.reject(res.error);
        } else {
          $http({
            method: "GET",
            url: globalSettings.serverChatDomainUrl + '/api/auth/token/',
            headers: { 'Authorization': res.token }
          }).then(function succes(response) {
            deferred.resolve(response.data.redirect_url);
          }, function error(response) {
            deferred.reject({error: response.status + ": " + response.statusText});
          });
        }
      });

      return deferred.promise;
    }

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

    function rateSessionMember(data) {
      var deferred = $q.defer();
      dbg.log2('#ChatSessions > rateSessionMember > make rest call');
      sessionMemberApi.rate(data, function(res) {
        dbg.log2('#ChatSessions > rateSessionMember > rest call responds');
        deferred.resolve(res);
      });

      return deferred.promise;
    }

    function prepareError(errors) {
      if(typeof errors == 'string') {
        return errors;
      }
      else {
        var string = '';
        for(var i in errors) {
          var error = errors[i];
          string += (error + '<br>');
        }
        return string;
      }
    };
  };
})();
