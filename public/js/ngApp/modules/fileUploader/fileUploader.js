(function () {
  'use strict';

  angular.module('KliikoApp.fileUploader', []).factory('fileUploader', fileUploaderFactory);

  fileUploaderFactory.$inject = ['$q', 'globalSettings', '$resource', 'dbg', 'Upload'];
  function fileUploaderFactory($q, globalSettings, $resource, dbg, Upload) {
    var fileUploaderApiLocal = $resource(globalSettings.restUrl + '/jwtToken');

    var thisToken = '';
    var fileUploader = {};
    var fileUploaderService = {};

    fileUploaderService.getToken = getToken;
    fileUploaderService.upload = upload;
    fileUploaderService.list = list;
    fileUploaderService.remove = remove;
    fileUploaderService.zip = zip;
    fileUploaderService.refresh = refresh;
    fileUploaderService.pingServer = pingServer;

    return fileUploaderService;

    function getToken() {
      var deferred = $q.defer();
      dbg.log2('#KliikoApp.fileUploader > get token');

      fileUploaderApiLocal.get({}, function(res) {
        dbg.log2('#KliikoApp.fileUploader > get token > server respond >');
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
          scope: data.scope,
          private: data.private,
          type: data.type,
          name: data.name
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

    function remove(resourceIds) {
      var deferred = $q.defer();
      dbg.log2('#KliikoApp.fileUploader > remove resources');

      resourceForServer('delete').delete({ 'ids[]': resourceIds }, function(result) {
        dbg.log2('#KliikoApp.fileUploader > remove resources > server respond >', result);
        deferred.resolve(result);
      }, function(error) {
        dbg.log2('#KliikoApp.fileUploader > remove resources > server error >', error);
        deferred.reject(error);
      });

      return deferred.promise;
    }

    function zip(resourceIds, name) {
      var deferred = $q.defer();
      dbg.log2('#KliikoApp.fileUploader > zip resources');

      resourceForServer('zip').post({ 'ids': resourceIds, name: name }, function(result) {
        dbg.log2('#KliikoApp.fileUploader > zip resources > server respond >', result);
        deferred.resolve(result);
      }, function(error) {
        dbg.log2('#KliikoApp.fileUploader > zip resources > server error >', error);
        deferred.reject(error);
      });

      return deferred.promise;
    }

    function refresh(resourceId) {
      var deferred = $q.defer();
      dbg.log2('#KliikoApp.fileUploader > refresh resource');

      resourceForServer('show/' + resourceId).get({}, function(result) {
        dbg.log2('#KliikoApp.fileUploader > refresh resource > server respond >', result);
        deferred.resolve(result);
      }, function(error) {
        dbg.log2('#KliikoApp.fileUploader > refresh resource > server error >', error);
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
      path = path || '';
      var server = serverData();
      return $resource(server.url + path, {}, {
        get: { method: 'GET', headers: server.headers },
        delete: { method: 'DELETE', headers: server.headers },
        post: { method: 'POST', headers: server.headers },
      });
    }
  }
})();
