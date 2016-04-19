(function () {
  'use strict';

  angular.module('KliikoApp.fileUploader', []).factory('fileUploader', fileUploaderFactory);

  fileUploaderFactory.$inject = ['$q', 'globalSettings', '$resource', 'dbg', '$ocLazyLoad', '$injector'];
  function fileUploaderFactory($q, globalSettings, $resource, dbg, $ocLazyLoad, $injector) {
    var Upload;
    $ocLazyLoad.load(['/js/vendors/ng-file-upload/ng-file-upload.js']).then(function() {
      Upload = $injector.get('Upload');
    });

    var fileUploaderApiLocal = $resource(globalSettings.restUrl + '/jwtToken');

    var thisToken = '';
    var fileUploader = {};
    var fileUploaderService = {};

    fileUploaderService.getToken = getToken;
    fileUploaderService.upload = upload;
    fileUploaderService.list = list;
    fileUploaderService.pingServer = pingServer;

    return fileUploaderService;

    function getToken() {
      var deferred = $q.defer();
      dbg.log2('#KliikoApp.fileUploader > get token');

      fileUploaderApiLocal.get({}, function(res) {
        dbg.log2('#KliikoApp.fileUploader > get token > server respond >', res);
        fileUploader.token = thisToken = res.token;
        pingServer().then(function() {
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

    function upload(data) {
      var deferred = $q.defer();
      var server = serverData();
      dbg.log2('#KliikoApp.fileUploader > upload file');

      Upload.upload({
        url: server.url + 'upload',
        method: 'POST',
        headers: server.headers,
        file: data.file,
        params: {
          scope: 'collage',
          private: data.private,
          type: data.type,
          name: data.title
        }
      }).then(function(result) {
        dbg.log2('#KliikoApp.fileUploader > upload file > server respond >', result);
        deferred.resolve(result);
      }, function(error) {
        dbg.log2('#KliikoApp.fileUploader > upload file > server error >', error);
        deferred.resolve(error);
      });

      return deferred.promise;
    }

    function list(type) {
      var deferred = $q.defer();
      dbg.log2('#KliikoApp.fileUploader > list resources');

      resourceForServer(type || 'all').get({}, function(result) {
        dbg.log2('#KliikoApp.fileUploader > list resources > server respond >', result);
        deferred.resolve(result);
      }, function(error) {
        dbg.log2('#KliikoApp.fileUploader > list resources > server error >', error);
        deferred.reject(error);
      });

      return deferred.promise;
    }

    function pingServer() {
      var deferred = $q.defer();
      dbg.log2('#KliikoApp.fileUploader > ping server');

      resourceForServer('ping').get({}, function(result) {
        dbg.log2('#KliikoApp.fileUploader > ping server > server respond >', result);
        deferred.resolve(result);
      }, function(error) {
        dbg.log2('#KliikoApp.fileUploader > ping server > server error >', error);
        deferred.reject(error);
      });

      return deferred.promise;
    }

    function serverData() {
      return {
        headers: { 'Authorization': thisToken },
        url: globalSettings.serverChatDomainUrl + '/api/resources/'
      };
    }

    function resourceForServer(path) {
      var server = serverData();
      return $resource(server.url + path, {}, { get: { method: 'GET', headers: server.headers } });
    }
  }
})();
