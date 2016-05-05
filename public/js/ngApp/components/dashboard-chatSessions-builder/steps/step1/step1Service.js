(function () {
  'use strict';
  angular.module('KliikoApp').factory('step1Service', step1Service);
  step1Service.$inject = ['globalSettings', '$q', '$resource', 'dbg'];

  function step1Service(globalSettings, $q, $resource, dbg) {

    var contactListApi = $resource(globalSettings.restUrl + '/contactLists/:path', null, {
    });

    var contactListsUserApi = {
      remove: $resource(globalSettings.restUrl +  '/contactListsUsersToRemove', {}, {post: {method: 'POST'}, put: {method: 'PUT'}}),
      createOrUpdate: $resource(globalSettings.restUrl +  '/contactListsUser/:id', {id:'@id'}, {post: {method: 'POST'}, put: {method: 'PUT'}}),
    };

    var contactService = {};

    contactService.getAllContacts = getAllContacts;
    contactService.createNewFcilitator = createNewFcilitator;
    contactService.deleteContact = deleteContact;
    contactService.updateContact = updateContact;
    return contactService;

    function getAllContacts() {
      var deferred = $q.defer();

      contactListApi.query({}, function(result) {
        if(result.error){
          deferred.reject(error);
        }else{
          deferred.resolve(result);
        }
      });

      return deferred.promise;
    };

    function createNewFcilitator(newFacilitatorData) {
      var deferred = $q.defer();

      contactListsUserApi.createOrUpdate.post({}, newFacilitatorData, function(res) {
        if (res.error) {
          deferred.reject(res.error);
        }else{
          deferred.resolve(res);
        }
      });

      return deferred.promise;
    };

    function deleteContact(id) {
      var deferred = $q.defer();

      contactListsUserApi.remove.post({}, {ids: [id]}, function(res) {
        if (res.error) {
          deferred.reject(res.error);
        }else{
          deferred.resolve(res);
        }
      });

      return deferred.promise;
    };

    function updateContact(facilitatorData) {
      var deferred = $q.defer();

      contactListsUserApi.createOrUpdate.put({ id: facilitatorData.defaultFields.id }, facilitatorData, function(res) {
        if (res.error) {
          deferred.reject(res.error);
        }else{
          deferred.resolve(res);
        }
      });

      return deferred.promise;
    };

  };
})();
