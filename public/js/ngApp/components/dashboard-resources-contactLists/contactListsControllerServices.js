(function () {
  'use strict';

  angular.module('KliikoApp').factory('contactListsControllerServices', contactListsControllerServicesFactory);

  contactListsControllerServicesFactory.$inject = ['globalSettings','$q', 'dbg', 'Upload'];
  function contactListsControllerServicesFactory(globalSettings, $q, dbg, Upload)  {

    var publicMethods = {};

    publicMethods.uploadImportFile = uploadImportFile;

    return publicMethods;


    function uploadImportFile(file, listId) {
      var deferred = $q.defer();
      Upload.upload({
        url: globalSettings.restUrl+'/contactLists/'+listId+'/import',
        method: 'POST',
        data: {file: file}
      }).then(function (resp) {
        console.log('Success ' + resp.config.data.file.name + 'uploaded. Response: ' + resp.data);
        deferred.resolve();
      }, function (resp) {
        console.log('Error status: ' + resp.status);
      }, function (evt) {
        var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
        console.log('progress: ' + progressPercentage + '% ' + evt.config.data.file.name);
      });

      return deferred.promise;
    }


  }
})();
