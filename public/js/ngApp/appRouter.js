(function () {
  'use strict';

  angular.module('KliikoApp').config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
    var prePath = '/js/ngApp/components/';

    // For any unmatched url, redirect to /home
    $urlRouterProvider.otherwise("/");


    $stateProvider
      .state('index', {
        abstract: true,
        url: "/",
        onEnter: ['$state', 'dbg', function ($state, dbg) {
          dbg.rs('index');
          $state.go('dashboard');
        }]
      })

      .state('dashboard', {
        url: "",
        onEnter: ['$state', '$stateParams', 'dbg', '$location', '$rootScope', function ($state, $stateParams, dbg, $location, $rootScope) {
          dbg.rs('dashboard');

          // make account profile default view on dashboard
          setTimeout(function () {
            if ($state.current.name == 'dashboard') $state.go('dashboard.accountProfile');
          }, 10);
        }],
        views: {
          'dashboard@': {templateUrl: prePath + "dashboard/dashboard.html"},
        }

      })

      .state('dashboard.accountProfile', {
        url: "/account-profile",
        views: {
          'dashboardContent@dashboard': {templateUrl: prePath + "dashboard-accountProfile/dashboard-content.html"}
        },
        onEnter: ['dbg', '$rootScope', 'banners', function (dbg, $rootScope, banners) {
          dbg.rs('dashboard.accountProfile is on');
          banners.setMainBannerForPage('profile');
        }]
      })

      .state('dashboard.accountProfile.upgradePlan', {
        url: "/upgrade-plan?step",
        views: {
          'accountProfileContent': {templateUrl: prePath + "dashboard-accountProfile-upgradePlan/dashboard-content.html"}
        },
        onEnter: ['dbg', function (dbg) {
          dbg.rs('dashboard.accountProfile.upgradePlan is on');
        }]

      })

      .state('dashboard.accountProfile.accountManagers', {
        url: "/account-managers",
        views: {
          'accountProfileContent': {templateUrl: prePath + "dashboard-accountProfile-accountManagers/dashboard-content.html"}
        },
        onEnter: ['dbg', function (dbg) {
          dbg.rs('dashboard.accountProfile.accountManagers is on');
        }]

      })

      .state('dashboard.accountProfile.promotionCode', {
        url: '/promotion-code',
        views: {
          'accountProfileContent': {templateUrl: prePath + "dashboard-accountProfile-promotionCode/dashboard-content.html"}
        },
        onEnter: ['dbg', function (dbg) {
          dbg.rs('dashboard.accountProfile.promotionCode is on');
        }]

      })

      .state('dashboard.accountProfile.bannerMessages', {
        url: '/banner-messages',
        views: {
          'accountProfileContent': {templateUrl: prePath + "dashboard-accountProfile-bannerMessages/dashboard-content.html"}
        },
        resolve: {
          checkPermission: ['$q', '$timeout', 'user', 'dbg', 'banners',function($q, $timeout, user, dbg, banners) {
            var deferred = $q.defer();

            user.canAccess('bannerMessages').then(
              function(res) {
                // load rarely needed module: ng-file-upload
                banners.initUpload().then(function() { deferred.resolve(); });

              },

              function(err) { dbg.warn(err); }

            );
            return deferred.promise;
          }]
        },
        onEnter: ['dbg', function (dbg) {
          dbg.rs('dashboard.accountProfile.bannerMessages is on');
        }]

      })

      .state('dashboard.accountProfile.accountDatabase', {
        url: '/account-database',
        views: {
          'accountProfileContent': {templateUrl: prePath + "dashboard-accountProfile-accountDatabase/dashboard-content.html"}
        },
        onEnter: ['dbg', function (dbg) {
          dbg.rs('dashboard.accountProfile.accountDatabase is on');
        }]

      })

      .state('dashboard.accountProfile.sessionRating', {
        url: '/session-rating',
        views: {
          'accountProfileContent': {templateUrl: prePath + "dashboard-accountProfile-sessionRating/dashboard-content.html"}
        },
        onEnter: ['dbg', function (dbg) {
          dbg.rs('dashboard.accountProfile.sessionRating is on');
        }]

      })

      ///////////////////////// Sessions
      .state('dashboard.chatSessions', {
        url: '/chatSessions',
        onEnter: ['$state', '$stateParams', 'dbg', '$location', 'banners', function ($state, $stateParams, dbg, $location, banners) {
          dbg.rs('chatSessions');

          $stateParams.bannerType = 'sessions';

          banners.setMainBannerForPage('sessions');

          setTimeout(function () {
           if ($state.current.name == 'dashboard.chatSessions') $state.go('dashboard.chatSessions');
          }, 10);

        }],
        views: {
          'dashboardContent@dashboard': {templateUrl: prePath + "dashboard-chatSessions/dashboard-content.html"}
        }

      })

      .state('dashboard.chatSessions.builder', {
        url: '/builder/:id',
        onEnter: ['$state', '$stateParams', 'dbg', '$location', 'banners', function ($state, $stateParams, dbg, $location, banners) {
          dbg.rs('chatSessions builder');
          $stateParams.bannerType = 'sessions';

          banners.setMainBannerForPage('sessions');

        }],
        views: {
          'dashboardContent@dashboard': {templateUrl: prePath + "dashboard-chatSessions-builder/session-builder-index.html"}
        }

      })

      ///////////////////////// Resources
      .state('dashboard.resources', {
        url: "/resources",
        onEnter: ['$state', '$stateParams', 'dbg', '$location', 'banners', function ($state, $stateParams, dbg, $location, banners) {
          dbg.rs('resources');

          $stateParams.bannerType = 'resources';

          banners.setMainBannerForPage('resources');

          //make account profile default view on dashboard
          setTimeout(function () {
            if ($state.current.name == 'dashboard.resources') $state.go('dashboard.resources.gallery');
          }, 10);

        }],
        views: {
          'dashboardContent@dashboard': {templateUrl: prePath + "dashboard-resources/resources.html"}
        }

      })

      .state('dashboard.resources.gallery', {
        url: "/gallery",
        views: {
          'resourcesContent': {templateUrl: prePath + "dashboard-resources-gallery/dashboard-content.html"}
        },

        resolve: {
          checkPermission: ['$q', '$timeout', 'user', 'dbg', 'banners',function($q, $timeout, user, dbg, banners) {
            var deferred = $q.defer();

            user.canAccess('bannerMessages').then(
              function(res) {
                // load rarely needed module: ng-file-upload
                banners.initUpload().then(function() { deferred.resolve(); });

              },

              function(err) { dbg.warn(err); }

            );
            return deferred.promise;
          }]
        },

        onEnter: ['dbg', function (dbg) {
          dbg.rs('dashboard.resources.gallery is on');
        }]

      })

      .state('dashboard.resources.contactLists', {
        url: "/contact-lists",
        views: {
          'resourcesContent': {templateUrl: prePath + "dashboard-resources-contactLists/dashboard-content.html"}
        },
        onEnter: ['dbg', function (dbg) {
          dbg.rs('dashboard.resources.contactLists is on');
        }]

      })
      .state('dashboard.resources.survey', {
        url: '/survey',
        views: {
          'resourcesContent': { templateUrl: prePath + 'dashboard-resources-contactLists-survey/dashboard-content.html' }
        },
        onEnter: ['dbg', function (dbg) {
          dbg.rs('dashboard.resources.contactLists.survey is on');
        }]

      })
      .state('dashboard.resources.topics', {
        url: "/topics",
        views: {
          'resourcesContent': {templateUrl: prePath + "dashboard-resources-topics/dashboard-content.html"}
        },
        onEnter: ['dbg', function (dbg) {
          dbg.rs('dashboard.resources.topics is on');
        }]

      })

      .state('dashboard.smsCredits', {
        url: "/smsCredits",
        views: {
          'dashboardContent@dashboard': {templateUrl: prePath + "dashboard-smsCredits/dashboard-content.html"}
        },



        onEnter: ['dbg', function (dbg) {
          dbg.rs('dashboard.smsCredits is on');
        }]

      })


      .state('dashboard.resources.emailTemplates', {
        url: "/email-templates",
        views: {
          'resourcesContent': {templateUrl: prePath + "dashboard-resources-emailTemplates/dashboard-content.html"}
        },
        onEnter: ['dbg', function (dbg) {
          dbg.rs('dashboard.resources.emailTemplates is on');
        }]

      })
      .state('dashboard.accountProfile.emailTemplates', {
        url: "/account-profile?systemMail",
        views: {
          'accountProfileContent': {templateUrl: prePath + "dashboard-resources-emailTemplates/dashboard-content.html"}
        },
        onEnter: ['dbg', function (dbg) {
          dbg.rs('dashboard.accountProfile.emailTemplates is on');
        }]

      })
      .state('dashboard.resources.brandColours', {
        url: '/brand-colours/:new?backTo&id',
        views: {
          'resourcesContent': {templateUrl: prePath + "dashboard-resources-brandColours/dashboard-content.html"}
        },
        onEnter: ['dbg', function (dbg) {
          dbg.rs('dashboard.resources.brandColours is on');
        }]

      })


  }]);

})();
