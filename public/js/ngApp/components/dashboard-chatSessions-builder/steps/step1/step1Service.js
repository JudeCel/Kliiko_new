(function () {
  'use strict';
  angular.module('KliikoApp').factory('step1Service', step1Service);
  step1Service.$inject = ['globalSettings', '$q', '$resource', 'dbg'];

  function step1Service(globalSettings, $q, $resource, dbg) {

    var accountDatabaseRestApi = $resource(globalSettings.restUrl + '/contactLists/:path', null, {
      // update: { method: 'PUT' },
      // findAll: { method: 'GET' },
      // status: { method: 'PUT', params: { path: 'status' } },
      // copy: { method: 'POST', params: { path: 'copy' } },
      // answer: { method: 'POST', params: { path: 'answer' } },
      // confirm: { method: 'PUT', params: { path: 'confirm' } },
      // constants: { method: 'GET', params: { path: 'constants' } }
    });


    var contactService = {};

    contactService.getAllContacts = getAllContacts;
    return contactService;

    function getAllContacts() {
      var deferred = $q.defer();

      accountDatabaseRestApi.query({}, function(result) {
        if(result.error){
          deferred.reject(error);
        }else{
          deferred.resolve(result);
        }
      });

      return deferred.promise;
    };
  };
})();
