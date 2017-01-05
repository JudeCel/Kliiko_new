angular.module('KliikoApp').factory('authResource', authResource);
authResource.$inject = ['$resource', 'globalSettings', '$window', '$http'];
angular.module('KliikoApp.Root').factory('authResource', authResource);

function authResource($resource, globalSettings, $window, $http) {
  return function(path, params, actions, options) {
    
    var token = 'Bearer ' + $window.localStorage.getItem("jwtToken");
    var headers = Object.keys($http.defaults.headers)

    for (var i = 0; i < headers.length; i++) {
      $http.defaults.headers[headers[i]].Authorization = token
    }

    return $resource(globalSettings.restUrl + path, params, actions, options);
  }
}
