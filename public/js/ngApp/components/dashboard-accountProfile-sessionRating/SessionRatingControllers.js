(function () {
  'use strict';

  angular.module('KliikoApp').controller('SessionRatingController', SessionRatingController);
  SessionRatingController.$inject = ['dbg', 'AccountDatabaseServices', '$modal', '$scope', '$rootScope', '$filter', 'angularConfirm', 'messenger', 'SessionRatingServices'];

  function SessionRatingController(dbg, AccountDatabaseServices, $modal, $scope, $rootScope, $filter, angularConfirm, messenger, SessionRatingServices) {
    dbg.log2('#SessionRatingController started');
    var vm = this;
    init();

    function init() {
      SessionRatingServices.findAllSessions().then(function(res) {
        getRatingTotal(res.data);
        vm.sessions = res.data;
      });
    };

    function getRatingTotal(data) {
      for (var i = 0; i < data.length; i++) {
        var d = data[i];
        d.ratingTotal = 0;
        d.open = false;
        var count = 0;
        for (var j = 0; j < d.Sessions.length; j++) {
          var s = d.Sessions[j];
          s.ratingTotal = 0;
          for (var k = 0; k < s.SessionMembers.length; k++) {
            s.ratingTotal += s.SessionMembers[k].rating;
          }

          if (s.SessionMembers.length > 0) {
            s.ratingTotal /= s.SessionMembers.length;
            d.ratingTotal += s.ratingTotal;
          }
        }

        if (d.Sessions.length > 0) {
          d.ratingTotal = d.Sessions.length;
        }
      }
    }
  };
})();
