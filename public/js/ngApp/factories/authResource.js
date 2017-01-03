angular.module('KliikoApp').factory('authResource', authResource);
authResource.$inject = ['$resource', 'globalSettings', 'fileUploader'];
angular.module('KliikoApp.Root').factory('authResource', authResource);

function authResource($resource, globalSettings, fileUploader) {
  return function(path, params, actions, options) {

    params = params || {}
    actions = actions || {}


    var token = 'Bearer ' + fileUploader.token;
    var actionsKeys = Object.keys(actions);

    for (var i = 0; i < actionsKeys.length; i++) {
      if (actions[actionsKeys[i]].headers) {
        actions[actionsKeys[i]].headers.Authorization = token;
      }else{
        actions[actionsKeys[i]].headers = { Authorization: token}
      }
    }

    // console.log(actions);
    return $resource(globalSettings.restUrl + path, params, actions, options);
  }
}
