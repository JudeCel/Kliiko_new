angular.module('KliikoApp').factory('authResource', authResource);
authResource.$inject = ['$resource', 'globalSettings', '$window'];
angular.module('KliikoApp.Root').factory('authResource', authResource);

function authResource($resource, globalSettings, $window) {
  return function(path, params, actions, options) {

    params = params || {}
    actions = actions || {}
    var token = 'Bearer ' + $window.localStorage.getItem("jwtToken");

    var actionsKeys = ['get', 'save', 'query', 'remove', 'delete'];

    for (var i = 0; i < actionsKeys.length; i++) {
      if (actions[actionsKeys[i]] && actions[actionsKeys[i]].headers) {
        actions[actionsKeys[i]].headers.Authorization = token;
      }else{
        actions[actionsKeys[i]] = {}
        actions[actionsKeys[i]].headers = { Authorization: token}
      }
    }

    return $resource(globalSettings.restUrl + path, params, actions, options);
  }
}
