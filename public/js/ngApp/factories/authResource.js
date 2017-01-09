angular.module('KliikoApp').factory('authResource', authResource);
authResource.$inject = ['$resource', 'globalSettings'];
angular.module('KliikoApp.Root').factory('authResource', authResource);

function authResource($resource, globalSettings) {
  return function(path, params, actions, options) {
    return $resource(globalSettings.restUrl + path, params, actions, options);
  }
}
