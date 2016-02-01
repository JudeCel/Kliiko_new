(function () {
  'use strict';

  angular.module('KliikoApp').factory('contactListsControllerServices', contactListsControllerServicesFactory);

  contactListsControllerServicesFactory.$inject = ['$q', 'dbg' ];
  function contactListsControllerServicesFactory($q, dbg)  {

    var publicServices = {};

    //publicServices.addNewUserToList = addNewUserToList;

    return publicServices;




  }
})();
