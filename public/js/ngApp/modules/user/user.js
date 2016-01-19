(function () {
  'use strict';

  angular.module('KliikoApp.user', []).factory('user', usersFactory);

  usersFactory.$inject = ['$q', 'globalSettings', '$resource', 'dbg'];
  function usersFactory($q, globalSettings, $resource, dbg) {
    var user = {};
    var canAccessCache = {};

    var usersRestApi = {
      userCanAccess: $resource(globalSettings.restUrl + '/user/canAccess', {}, {post: {method: 'POST'}}),
      user: $resource(globalSettings.restUrl + '/user', {}, {post: {method: 'POST'}, changePassword: {method: 'PUT'}}),

    };

    var UserService = {};

    UserService.getUserData = getUserData;
    UserService.updateUserData = updateUserData;
    UserService.changeUserPassword = changeUserPassword;
    UserService.canAccess = canAccess;

    return UserService;

    /**
     * Get users data from db or from cache
     * @param [forceUpdate] {boolean} - ignore cache
     * @returns {*}
     */
    function getUserData(forceUpdate) {
      dbg.log2('#KliikoApp.user > get all user details');
      var deferred = $q.defer();

      if (user && user.id && !forceUpdate) {
        dbg.log2('#KliikoApp.user > get all user details > return cached value');
        deferred.resolve(user);
        return deferred.promise;

      }


      dbg.log2('#KliikoApp.user > get all user details > will return value from server');
      usersRestApi.user.get({}, function (res) {
        dbg.log2('#KliikoApp.user > get all user details > server respond >', res);

        //cache this data
        user = new User(res);

        deferred.resolve(user);
      });

      return deferred.promise;

      function User(rawData) {
        var self = this;
        for (var key in rawData) {
          if (rawData.hasOwnProperty(key)) {
            self[key] = rawData[key];
          }
        }

        fetchRoles();
        checkPlansAndTrials();

        /**
         * Make user.isAdmin = true if user.roles array contain 'admin'
         * the same for all other types of possible roles
         */
        function fetchRoles() {
          if (!rawData.role || !rawData.role.length) return;

          for (var i = 0, len = rawData.role.length; i < len ; i++) {
            var role = 'is'+rawData.role[i].capitalize();
            self[role] = true;
          }
        }

        function checkPlansAndTrials() {
          if (!self.subscriptions)  return;

          if (self.subscriptions.planId) {
            var legalPlans = (
              self.subscriptions.planId === 'plan1' ||
              self.subscriptions.planId === 'plan2' ||
              self.subscriptions.planId === 'plan3'
            );
            if (!legalPlans) dbg.error('#KliikoApp.user > planId is not recognized! \n' +
              'Should be one of the following: "plan1", "plan2" or "plan3". \n' +
              'Recieved: "'+self.subscriptions.planId+'"');
          }

          if (self.subscriptions.planId === 'plan3') self.onMaximumPlan = true;

          if (self.subscriptions.status === 'in_trial') {
            var trialEndDate = moment(self.subscriptions.trialEnd);
            self.trial ={daysLeft: Math.round( moment.duration(trialEndDate.diff()).asDays() ) };
          }

        }

      }
    }


    /**
     * Update and save in db and memory cache all user data
     * @param data {object} - user form object
     */
    function updateUserData(data) {
      var deferred = $q.defer();

      usersRestApi.user.post(data, function (res) {
        if (res.error) {
          deferred.reject(res.error);
          return deferred.promise;
        }
        user = res;
        deferred.resolve();
      });


      return deferred.promise;

    }

    function changeUserPassword(data){
      var deferred = $q.defer();

      usersRestApi.user.changePassword(data, function (res) {
        deferred.resolve(res);
      });
      return deferred.promise;
    }

    function canAccess(section) {
      var deferred = $q.defer();

      if (!section) {
        dbg.error('#KliikoApp.user > canAccess > no @section param is provided');
        deferred.reject({error: 'no @section param is provided'});
        return deferred.promise;
      }

      // return cached value
      if (canAccessCache[section]) {
        deferred.resolve();
        return deferred.promise;
      }

      usersRestApi.userCanAccess.post({}, {section: section}, function (res) {
        if (!res.accessPermitted) {
          canAccessCache[section] = false;
          deferred.reject(res);
          return deferred.promise;
        }
        canAccessCache[section] = true;
        deferred.resolve(res);
      });

      return deferred.promise;

    }
  }


})();

