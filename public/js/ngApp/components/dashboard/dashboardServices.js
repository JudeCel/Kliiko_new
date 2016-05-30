(function () {
  'use strict';

  angular.module('KliikoApp.Root').factory('dashboardServices', dashboardServices);
  dashboardServices.$inject = ['globalSettings', '$q', '$resource', 'dbg', '$http'];

  function dashboardServices(globalSettings, $q, $resource, dbg, $http) {
    var myDashboardApi = $resource(globalSettings.restUrl + '/myDashboard/:path', null, {
      data: { method: 'GET', params: { path: 'data' } }
    });

    var jwtTokenApi = $resource(globalSettings.restUrl + '/jwtToken');

    var services = {};
    services.getAllData = getAllData;
    services.generateRedirectLink = generateRedirectLink;
    return services;

    function generateRedirectLink() {
      var deferred = $q.defer();

      jwtTokenApi.get({}, function(res) {
        if(res.error) {
          deferred.reject(res.error);
        } else {
          var server = serverData('auth/token', res.token);

          $http({
            method: "GET",
            url: server.url
          }).then(function succes(response) {
            deferred.resolve(response);
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
