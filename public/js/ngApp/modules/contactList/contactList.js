(function () {
  'use strict';

  angular.module('contactList', []).factory('contactListServices', contactListFactory);

  contactListFactory.$inject = ['$q','globalSettings', '$resource', 'dbg', 'user'];
  function contactListFactory($q, globalSettings, $resource, dbg, user)  {
    var currentUser;

    var contactListApi = {
      contactLists: $resource(globalSettings.restUrl +  '/contactLists/:id', {id:'@id'}, {post: {method: 'POST'}, put: {method: 'PUT'}}),
      contactListsUsersToRemove: $resource(globalSettings.restUrl +  '/contactListsUsersToRemove', {}, {post: {method: 'POST'}, put: {method: 'PUT'}}),
      contactListUser: $resource(globalSettings.restUrl +  '/contactListUser/:id', {id:'@id'}, {post: {method: 'POST'}, put: {method: 'PUT'}}),
    };


    var publicServices = {};

    publicServices.getContactLists = getContactLists;
    publicServices.createUser = createUser;
    publicServices.submitNewList = submitNewList;
    publicServices.deleteUser = deleteUser;
    publicServices.deleteList = deleteList;

    return publicServices;


    function getContactLists() {
      var deferred = $q.defer();

      dbg.log2('#contactListServices > getContactLists > call to api');
      contactListApi.contactLists.query(function(res) {
        if (res.error) {
          dbg.log1('#contactListServices > getContactLists > error: ', res.error);
          deferred.reject(res.error);
          return deferred.promise;
        }
        dbg.log1('#contactListServices > getContactLists > success'); dbg.log2(res);
        deferred.resolve(res);
      });
      return deferred.promise;
    }


    /**
     * Create contact list user
     * @param userObj {object}
     * @param contactListId {number}
     * @returns {*|promise}
     */
    function createUser(userObj, contactListId) {
      var deferred = $q.defer();


      var params = {
        defaultFields: userObj,
        contactListId: contactListId
      };

      dbg.log2('#contactListServices > createUser > call to api');
      contactListApi.contactListUser.post({},params,function(res) {
        if (res.error) {
          dbg.log1('#contactListServices > createUser > error: ', res.error);
          deferred.reject(res.error);
          return deferred.promise;
        }
        dbg.log1('#contactListServices > createUser > success '); dbg.log2(res);

        deferred.resolve(res);
      });

      return deferred.promise;

    }

    function deleteUser(ids) {
      var deferred = $q.defer();

      dbg.log2('#contactListServices > deleteUser > call to api');
      contactListApi.contactListsUsersToRemove.post({},{ids:ids},function(res) {
        if (res.error) {
          dbg.log1('#contactListServices > deleteUser > error: ', res.error);
          deferred.reject(res.error);
          return deferred.promise;
        }
        dbg.log1('#contactListServices > deleteUser > success '); dbg.log2(res);

        deferred.resolve(res);
      });

      return deferred.promise;
    }

    function submitNewList(listObj) {
      var deferred = $q.defer();

      var customFields = [];

      // where 13 is maximum custom field allowed (12)
      for (var i = 1; i < 13 ; i++) {
        if (listObj['customField'+i] && listObj['customField'+i].length) customFields.push(listObj['customField'+i]);
      }

      contactListApi.contactLists.post({}, {name:listObj.name, customFields: customFields},function(res) {
        deferred.resolve(res);
      });
      return deferred.promise;

    }

    function deleteList(listId) {
      var deferred = $q.defer();
      contactListApi.contactLists.delete({id:listId}, {},function(res) {
        if (res.error) {   deferred.reject(res.error);  return deferred.promise;   }

        deferred.resolve(res);
      });

      return deferred.promise;
    }
  }
})();
