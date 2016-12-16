(function () {
  'use strict';

  angular.module('contactList', []).factory('contactListServices', contactListFactory);

  contactListFactory.$inject = ['$q','globalSettings', '$resource', 'dbg', 'Upload'];
  function contactListFactory($q, globalSettings, $resource, dbg, Upload)  {
    var contactListsApi = {
      contactLists: $resource(globalSettings.restUrl +  '/contactLists/:id', {id:'@id'}, {post: {method: 'POST'}, put: {method: 'PUT'}}),
      contactListsUsersToRemove: $resource(globalSettings.restUrl +  '/contactListsUsersToRemove', {}, {post: {method: 'POST'}, put: {method: 'PUT'}}),
      contactListsUser: $resource(globalSettings.restUrl +  '/contactListsUser/:id', {id:'@id'}, {post: {method: 'POST'}, put: {method: 'PUT'}}),
      contactListsImport: $resource(globalSettings.restUrl +  '/contactLists/:id/import', {id:'@id'}, {post: {method: 'POST'}, put: {method: 'PUT'}}),
      contactListsValidate: $resource(globalSettings.restUrl +  '/contactLists/:id/validate', {id:'@id'}, {post: {method: 'POST'}}),
      contactComments: $resource(globalSettings.restUrl +  '/contactListsUser/comments', {}, {post: {method: 'POST'}})
    };


    var publicServices = {};

    publicServices.getContactLists = getContactLists;
    publicServices.submitNewList = submitNewList;
    publicServices.updateList = updateList;
    publicServices.deleteList = deleteList;

    publicServices.createUser = createUser;
    publicServices.updateUser = updateUser;
    publicServices.deleteUser = deleteUser;
    publicServices.getContactComments = getContactComments;

    publicServices.parseImportFile = parseImportFile;
    publicServices.addImportedContacts = addImportedContacts;
    publicServices.validateContactImportData = validateContactImportData;


    return publicServices;


    /**
     * Fetch all contact lists for this account
     * @returns {*|promise|array}
     */
    function getContactLists(params) {
      var deferred = $q.defer();
      dbg.log2('#contactListServices > getContactLists > call to api');
      contactListsApi.contactLists.query(params, function(res) {
        if (res.error) {
          dbg.log1('#contactListServices > getContactLists > error: ', res.error);
          deferred.reject(res.error);
          return deferred.promise;
        }
        dbg.log1('#contactListServices > getContactLists > success'); dbg.log2(res);

        var output = angular.copy(res);
        output = prepareCustomFieldsData(output);

        deferred.resolve(output);
      });
      return deferred.promise;



      function prepareCustomFieldsData(input) {
        console.log(input.length, input);
        for (var i = 0; i < input.length ; i++) {
          for (var j = 0; j < input[i].members.length ; j++) {
            if (input[i].members[j].customFields) {
              input[i].members[j].CustomFieldsObject = input[i].members[j].data.customFields;
            }
          }
        }
        return input;
      }
    }

    /**
     * Create New contacts list
     * @param listObj {object}
     * @returns {*|promise}
     */
    function submitNewList(listObj) {
      var deferred = $q.defer();

      var newListObj = {
          name: listObj.name,
          customFields: listObj.customFields
      };

      contactListsApi.contactLists.post({}, newListObj , function(res) {
        if (res.error) { deferred.reject(res.error); return deferred.promise; }

        deferred.resolve(res);
      });
      return deferred.promise;

    }


    /**
     * update existing contacts list
     * @param listId {number} - list id
     * @param listObj {object} -  list object
     * @returns {*}
     */
    function updateList(listId, listObj) {
      var deferred = $q.defer();

      var customFields = listObj.customFields;
      var newObject = angular.copy(listObj);
      newObject.name = listObj.name;
      newObject.customFields = customFields;
      newObject.visibleFields = listObj.visibleFields;

      contactListsApi.contactLists.put({id:listId}, newObject , function(res) {
        if (res.error) { deferred.reject(res.error); return deferred.promise; }

        deferred.resolve(res);
      });
      return deferred.promise;
    }

    /**
     * Delete Contact List by Id
     * @param listId {number}
     * @returns {*|promise}
     */
    function deleteList(listId) {
      var deferred = $q.defer();
      contactListsApi.contactLists.delete({id:listId}, {},function(res) {
        if (res.error) {  deferred.reject(res.error);  return deferred.promise;  }

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

      var defaultFields, customFields;

      customFields = userObj.CustomFieldsObject;
      delete userObj.CustomFieldsObject;
      defaultFields = userObj;

      var params = {
        defaultFields: defaultFields,
        customFields: customFields,
        contactListId: contactListId
      };

      dbg.log2('#contactListServices > createUser > call to api');
      contactListsApi.contactListsUser.post({},params,function(res) {
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

    /**
     * Update contact list user
     * @param userObj {object}
     * @param contactListId {number}
     * @returns {*|promise}
     */
    function updateUser(userObj, contactListId) {
      var deferred = $q.defer();
      var params = userObj;
      params.contactListId = contactListId;

      dbg.log2('#contactListServices > updateUser > call to api');
      contactListsApi.contactListsUser.put({id:userObj.defaultFields.id}, params, function(res) {
        if (res.error) {
          dbg.log1('#contactListServices > updateUser > error: ', res.error);
          deferred.reject(res.error);
          return deferred.promise;
        }

        dbg.log1('#contactListServices > updateUser > success '); dbg.log2(res);

        deferred.resolve(res);
      });

      return deferred.promise;

    }




    /**
     * Delete one ore more users by given id
     * @param ids {array} - array of numbers
     * @returns {*|promise}
     */
    function deleteUser(ids) {
      var deferred = $q.defer();

      dbg.log2('#contactListServices > deleteUser > call to api');
      contactListsApi.contactListsUsersToRemove.post({},{ids:ids},function(res) {
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

    function parseImportFile(file, listId) {
      var deferred = $q.defer();

      Upload.upload({
        url: globalSettings.restUrl+'/contactLists/'+listId+'/import',
        method: 'POST',
        data: {uploadedfile: file}
      }).then(function (res) {
        deferred.resolve(res);
      }, function (err) {
        deferred.reject(err);
      });
      return deferred.promise;
    }

    function addImportedContacts(contactsArray, listId) {
      var deferred = $q.defer();

      for (var i = 0, len = contactsArray.length; i < len ; i++) {

      }

      var params = {
        contactsArray:contactsArray
      };

      contactListsApi.contactListsImport.put({id:listId},params,function(res) {
        if (res.error) {
          dbg.log1('#contactListServices > createUser > error: ', res.error);
          deferred.reject(res.error);
        } else {
          dbg.log1('#contactListServices > createUser > success '); dbg.log2(res);
          deferred.resolve(res);
        }
      });


      return deferred.promise;
    }

    function validateContactImportData(listId, contactList) {
      var params = {
        contactsArray: contactList
      };
      var deferred = $q.defer();

      contactListsApi.contactListsValidate.post({ id: listId }, params, function(res) {
        if (res.error) {
          deferred.reject(res.error);
        } else {
          deferred.resolve(res);
        }
      });

      return deferred.promise;
    }

    function getContactComments(contactListId, id) {
      var deferred = $q.defer();

      dbg.log2('#contactListServices > getContactComments > call to api');
      contactListsApi.contactComments.post({},{ contactListId: contactListId, id: id },function(res) {
        if (res.error) {
          dbg.log1('#contactListServices > getContactComments > error: ', res.error);
          deferred.reject(res.error);
        } else {
          dbg.log1('#contactListServices > getContactComments > success '); dbg.log2(res);
          deferred.resolve(res.data);
        }
      });

      return deferred.promise;
    }


  }
})();
