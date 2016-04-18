(function () {
  'use strict';

  angular.module('KliikoApp.fileUploader', []).factory('fileUploader', fileUploaderFactory);

  fileUploaderFactory.$inject = ['$q', 'globalSettings', '$resource', 'dbg'];
  function fileUploaderFactory($q, globalSettings, $resource, dbg) {
    var fileUploaderApiLocal = $resource(globalSettings.restUrl + '/jwtToken');

    var fileUploader = {};
    var fileUploaderService = {};

    fileUploaderService.getToken = getToken;
    fileUploaderService.pingServer = pingServer;

    return fileUploaderService;

    function getToken() {
      var deferred = $q.defer();
      dbg.log2('#KliikoApp.fileUploader > get token');

      fileUploaderApiLocal.get({}, function(res) {
        dbg.log2('#KliikoApp.fileUploader > get token > server respond >', res);
        fileUploader.token = res.token;
        pingServer(res.token).then(function() {
          console.log("can ping");
          deferred.resolve(fileUploader);
        }, function(error) {
          console.error("some error");
          console.error(error);
          deferred.resolve(fileUploader);
        });
      }, function(error) {
        deferred.reject(error);
      });

      return deferred.promise;
    }

    function pingServer(token) {
      var deferred = $q.defer();
      dbg.log2('#KliikoApp.fileUploader > ping server');

      resourceForServer(token).get({}, function(res) {
        dbg.log2('#KliikoApp.fileUploader > ping server > server respond >', res);
        deferred.resolve();
      }, function(error) {
        deferred.reject(error);
      });

      return deferred.promise;
    }

    function resourceForServer(token) {
      return $resource(globalSettings.serverChatDomainUrl + '/api/resources/ping', {},
        {
          'Authorization': token,
        }
      );
    }
  }
})();
