(function () {
  'use strict';

  angular.module('KliikoApp.Root').factory('dashboardServices', dashboardServices);
  dashboardServices.$inject = ['globalSettings', '$q', '$resource', 'dbg', '$http'];

  function dashboardServices(globalSettings, $q, $resource, dbg, $http) {
    var myDashboardApi = $resource(globalSettings.restUrl + '/myDashboard/:path', null, {
      data: { method: 'GET', params: { path: 'data' } }
    });

    var jwtTokenForMemberApi = $resource(globalSettings.restUrl + '/jwtTokenForMember');

    var services = {};
    services.getAllData = getAllData;
    services.generateRedirectLink = generateRedirectLink;
    return services;

    function generateRedirectLink(sessionId) {
      var deferred = $q.defer();

      jwtTokenForMemberApi.get({ sessionId: sessionId }, function(res) {
        console.log(res.token);
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

    function getAllData() {
      var deferred = $q.defer();

      dbg.log2('#dashboardServices > getAllData > make rest call');
      myDashboardApi.data({}, function(res) {
        dbg.log2('#dashboardServices > getAllData > rest call responds');
        deferred.resolve(res);
      });

      return deferred.promise;
    };

    function serverData(what, token) {
      return {
        headers: { 'Authorization': token },
        url: globalSettings.serverChatDomainUrl + '/api/' + what +  '/'
      };
    };
  };
})();
