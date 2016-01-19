(function () {
  'use strict';

  angular.module('contactList', []).factory('contactListServices', contactListFactory);

  contactListFactory.$inject = ['$q','globalSettings', '$resource', 'dbg', 'user'];
  function contactListFactory($q, globalSettings, $resource, dbg, user)  {
    var currentUser;


    var contactListApi = {
      contactList: $resource(globalSettings.restUrl +  '/contactLists', {}, {post: {method: 'POST'}, put: {method: 'PUT'}}),
      contactListUser: $resource(globalSettings.restUrl +  '/contactListUser/:id', {id:'@id'}, {post: {method: 'POST'}, put: {method: 'PUT'}}),
    };

    init();

    var publicServices = {};

    publicServices.getContactLists = getContactLists;
    publicServices.createUser = createUser;

    return publicServices;

    function init() {
      user.getUserData().then(function(res) { currentUser = res; });
    }

    function getContactLists() {
      var deferred = $q.defer();

      contactListApi.contactList.query(function(res) {
        deferred.resolve(res);
      });
      return deferred.promise;
    }

    function createUser(userObj, contactListId) {
      var deferred = $q.defer();


      var params = {
        defaultFields: userObj,
        contactListId: contactListId,
        userId: currentUser.id
      };

      contactListApi.contactList.post({},params,function(res) {
        deferred.resolve(res);
      });

      deferred.resolve();
      return deferred.promise;

    }
  }
})();
