(function () {
  'use strict';

  angular.module('KliikoApp.Root').factory('dashboardServices', dashboardServices);
  dashboardServices.$inject = ['globalSettings', '$q', '$resource', 'dbg'];

  function dashboardServices(globalSettings, $q, $resource, dbg) {
    var myDashboardApi = $resource('/myDashboard/data', null, {
      get: { method: 'GET'}
    });

    var services = {};
    services.getAllData = getAllData;
    return services;

    function getAllData() {
      var deferred = $q.defer();

      dbg.log2('#dashboardServices > getAllData > make rest call');
      myDashboardApi.get({}, function(res) {
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
