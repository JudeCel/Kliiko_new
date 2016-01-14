(function () {
  'use strict';
  angular.module('KliikoApp').factory('topicServices', topicsServicesFactory);

  topicsServicesFactory.$inject = ['$q', 'globalSettings', '$resource', 'dbg'];
  function topicsServicesFactory($q, globalSettings, $resource, dbg) {
    var topicsServicesPublicMEthods = {};


    return topicsServicesPublicMEthods;
  }


})();



