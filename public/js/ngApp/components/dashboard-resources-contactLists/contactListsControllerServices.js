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
        data: {uploadedfile: file}
      }).then(function (resp) {
        deferred.resolve(resp);
      }, function (resp) {
        console.log('Error status: ' + resp.status);
      }, function (evt) {
        // progrss case

      });

      return deferred.promise;
    }


  }
})();
