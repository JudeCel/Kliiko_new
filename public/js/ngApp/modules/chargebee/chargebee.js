(function () {
  'use strict';

  angular.module('chargebee', []).factory('chargebee', chargebeeFactory);

  chargebeeFactory.$inject = ['$q','globalSettings', '$resource', 'dbg'];
  function chargebeeFactory($q, globalSettings, $resource, dbg)  {
    var chargebeeRestApi = {
      userCanAccess: $resource(globalSettings.restUrl+'/user/canAccess', {}, {post: {method: 'POST'} }),
      user: $resource(globalSettings.restUrl+'/user', {}, {post: {method: 'POST'} })
    };

    var chargebeeFactoryPublicMethods = {};

    return chargebeeFactoryPublicMethods;

  }


})();

