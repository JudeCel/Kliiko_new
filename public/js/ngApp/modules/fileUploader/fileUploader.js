(function () {
  'use strict';

  angular.module('KliikoApp.fileUploader', []).factory('fileUploader', fileUploaderFactory);

  fileUploaderFactory.$inject = ['$q', 'globalSettings', '$resource', 'dbg', 'Upload'];
  function fileUploaderFactory($q, globalSettings, $resource, dbg, Upload) {
    var fileUploaderApiLocal = $resource(globalSettings.restUrl + '/jwtToken');

    var requestError = 'Request failed';
    var fileUploaderService = {};

    fileUploaderService.token = null;
    fileUploaderService.getToken = getToken;
    fileUploaderService.upload = upload;
    fileUploaderService.list = list;
    fileUploaderService.remove = remove;
    fileUploaderService.zip = zip;
    fileUploaderService.refresh = refresh;
    fileUploaderService.survey = survey;
    fileUploaderService.banner = banner;
    fileUploaderService.pingServer = pingServer;

    return fileUploaderService;

    function getToken() {
      var deferred = $q.defer();
      dbg.log2('#KliikoApp.fileUploader > get token');

      fileUploaderApiLocal.get({}, function(res) {
        dbg.log2('#KliikoApp.fileUploader > get token > server respond >');
        if(res.error) {
          deferred.reject(res.error);
        }
        else {
          fileUploaderService.token = res.token;
          deferred.resolve({ token: res.token });
        }
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
          stock: data.stock,
          type: data.type,
          name: data.name
        }
      }).then(function(result) {
        dbg.log2('#KliikoApp.fileUploader > upload file > server respond >', result);
        deferred.resolve(result);
      }, function(error) {
        // This is because angular file upload can't understand CORS origin responses.
        switch (true) {
          case error.status == -1:
            deferred.reject("File is too big");
            break;
          case Array.isArray(error.data.errors.type):
            deferred.reject(error.data.errors.type[0]);
            break;
          case typeof error.data.errors === 'object':
            deferred.reject(error.data.errors);
            break;
          default:
            deferred.reject(requestError);
        }
      });

      return deferred.promise;
    }

    function list(params) {
      params = params || {};
      var deferred = $q.defer();
      dbg.log2('#KliikoApp.fileUploader > list resources');

      resourceForServer('resources', '').get({ 'type[]': params.type, 'scope[]': params.scope, stock: params.stock }, function(result) {
        dbg.log2('#KliikoApp.fileUploader > list resources > server respond >', result);
        deferred.resolve(result);
      }, function(error) {
        dbg.log2('#KliikoApp.fileUploader > list resources > server error >', error);
        deferred.reject(error.data || requestError);
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
        deferred.reject(error.data || requestError);
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
        deferred.reject(error.data || requestError);
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
        deferred.reject(error.data || requestError);
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
        deferred.reject(error.data || requestError);
      });

      return deferred.promise;
    }

    function banner() {
      var deferred = $q.defer();
      dbg.log2('#KliikoApp.fileUploader > banner resource');

      resourceForServer('banners').get({}, function(result) {
        dbg.log2('#KliikoApp.fileUploader > banner resource > server respond >', result);
        deferred.resolve(result);
      }, function(error) {
        dbg.log2('#KliikoApp.fileUploader > banner resource > server error >', error);
        deferred.reject(error.data || requestError);
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
        deferred.reject(error.data || requestError);
      });

      return deferred.promise;
    }

    function serverData(what) {
      return {
        headers: { 'Authorization': fileUploaderService.token },
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
