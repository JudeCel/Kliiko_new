(function () {
  'use strict';

  angular.module('contactList', []).factory('contactListServices', contactListFactory);

  contactListFactory.$inject = ['$q','globalSettings', '$resource', 'dbg'];
  function contactListFactory($q, globalSettings, $resource, dbg)  {
    var publicServices = {};

    var contactListApi = {
      index: $resource(globalSettings.restUrl +  '/contactLists', {}),
      create: $resource(globalSettings.restUrl +  '/contactLists', {}, {post: {method: 'POST'}}),
    };

    publicServices.getContactLists = getContactLists;

    return publicServices;

    function getContactLists() {
      var deferred = $q.defer();

      contactListApi.index.query(function(res) {
        deferred.resolve(res);
      });
      return deferred.promise;
    }
  }
})();
