(function () {
  'use strict';

  angular.module('KliikoApp.Root').factory('dashboardServices', dashboardServices);
  dashboardServices.$inject = ['globalSettings', '$q', '$resource', 'dbg'];

  function dashboardServices(globalSettings, $q, $resource, dbg) {
    var myDashboardApi = $resource(globalSettings.restUrl + '/myDashboard/:path', null, {
      data: { method: 'GET', params: { path: 'data' } }
    });

    var jwtTokenApi = $resource(globalSettings.restUrl + '/jwtToken');

    var services = {};
    services.getAllData = getAllData;
    services.generateRedirectLink = generateRedirectLink;
    return services;

    function generateRedirectLink(params) {
      var deferred = $q.defer();

      jwtTokenApi.get(params, function(res) {
        if(res.error) {
          deferred.reject(res.error);
        } else {
          deferred.resolve({ url: res.url });
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
  };
})();
