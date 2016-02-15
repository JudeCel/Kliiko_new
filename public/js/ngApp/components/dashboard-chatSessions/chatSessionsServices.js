(function () {
  'use strict';
  angular.module('KliikoApp').factory('chatSessionsServices', chatSessionsServices);
  chatSessionsServices.$inject = ['globalSettings', '$q', '$resource', 'dbg'];

  function chatSessionsServices(globalSettings, $q, $resource, dbg) {
    var chatSessionApi = $resource(globalSettings.restUrl + '/session/:id', null, {
      get: { method: 'get', params: { id: 'list' } },
      copy: { method: 'post', params: { id: '@id' } },
      remove: { method: 'delete', params: { id: '@id' } }
    });

    var sessionMemberApi = $resource(globalSettings.restUrl + '/sessionMember/:path/:id', null, {
      rate: { method: 'post', params: { id: '@id', path: 'rate' } }
    });

    var csServices = {};
    csServices.findAllSessions = findAllSessions;
    csServices.removeSession = removeSession;
    csServices.copySession = copySession;
    csServices.rateSessionMember = rateSessionMember;
    csServices.prepareError = prepareError;
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

    function rateSessionMember(data) {
      var deferred = $q.defer();
      console.log(data);
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
