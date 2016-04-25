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
    fileUploaderService.survey = survey;
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
      var server = serverData('resources');
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

    function list(params) {
      params = params || {};
      var deferred = $q.defer();
      dbg.log2('#KliikoApp.fileUploader > list resources');

      resourceForServer('resources', '').get({ 'type[]': params.type, 'scope[]': params.scope }, function(result) {
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

      resourceForServer('resources', 'delete').delete({ 'ids[]': resourceIds }, function(result) {
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

      resourceForServer('resources', 'zip').post({ 'ids': resourceIds, name: name }, function(result) {
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

      resourceForServer('resources', resourceId).get({}, function(result) {
        dbg.log2('#KliikoApp.fileUploader > refresh resource > server respond >', result);
        deferred.resolve(result);
      }, function(error) {
        dbg.log2('#KliikoApp.fileUploader > refresh resource > server error >', error);
        deferred.reject(error);
      });

      return deferred.promise;
    }

    function survey(surveyId) {
      var deferred = $q.defer();
      dbg.log2('#KliikoApp.fileUploader > survey resource');

      resourceForServer('surveys', surveyId).get({}, function(result) {
        dbg.log2('#KliikoApp.fileUploader > survey resource > server respond >', result);
        deferred.resolve(result);
      }, function(error) {
        dbg.log2('#KliikoApp.fileUploader > survey resource > server error >', error);
        deferred.reject(error);
      });

      return deferred.promise;
    }

    function pingServer() {
      var deferred = $q.defer();
      dbg.log2('#KliikoApp.fileUploader > ping server');

      resourceForServer('resources', 'ping').get({}, function(result) {
        dbg.log2('#KliikoApp.fileUploader > ping server > server respond >', result);
        deferred.resolve(result);
      }, function(error) {
        dbg.log2('#KliikoApp.fileUploader > ping server > server error >', error);
        deferred.reject(error);
      });

      return deferred.promise;
    }

    function serverData(what) {
      return {
        headers: { 'Authorization': thisToken },
        url: globalSettings.serverChatDomainUrl + '/api/' + what +  '/'
      };
    }

    function resourceForServer(what, path) {
      path = path || '';
      var server = serverData(what);
      return $resource(server.url + path, {}, {
        get: { method: 'GET', headers: server.headers },
        delete: { method: 'DELETE', headers: server.headers },
        post: { method: 'POST', headers: server.headers },
      });
    }
  }
})();
