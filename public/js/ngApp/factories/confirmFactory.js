angular.module('KliikoApp').factory('angularConfirm', angularConfirm);
angular.module('KliikoApp.Root').factory('angularConfirm', angularConfirm);
angularConfirm.$inject = ['$window', '$q'];

function angularConfirm($window, $q) {
  function confirm(message) {
    var defer = $q.defer();
    if($window.confirm(message)) {
      defer.resolve(true);
    } else {
      defer.reject(false);
    }
    return(defer.promise);
  }
  return(confirm);
}
