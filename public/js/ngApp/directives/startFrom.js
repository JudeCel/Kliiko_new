angular.module('KliikoApp').filter('startFrom', function(){
  return function(data, start) {
    if (data) {
      start = +start; //parse to int
      return data.slice(start);
    } else {
      return [];
    }
  }
});