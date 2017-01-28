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
        onEnter: ['$state', 'dbg', function($state, dbg) {
          dbg.rs('index');
          $state.go('account-hub');
        }]
      })
      .state('account-hub', {
        url: "",
        onEnter: ['$state', 'dbg', function($state, dbg) {
          dbg.rs('account-hub');

          setTimeout(function() {
            if ($state.current.name == 'account-hub') $state.go('account-hub.accountProfile');
          }, 10);
        }],
        views: {
          'account-hub@': {templateUrl: prePath + "dashboard/dashboard.html"},
        }
      })
      .state('account-hub.accountProfile', {
        url: "/account-profile",
        views: {
          'dashboardContent@account-hub': {templateUrl: prePath + "dashboard-accountProfile/dashboard-content.html"}
        },
        onEnter: ['$state', 'dbg', 'user', function($state, dbg, user) {
          dbg.rs('account-hub.accountProfile is on');
          sessionStorage.setItem('bannerType', 'profile');
        }]
      })
      .state('account-hub.accountProfile.upgradePlan', {
        url: "/upgrade-plan?step",
        views: {
          'accountProfileContent': {templateUrl: prePath + "dashboard-accountProfile-upgradePlan/dashboard-content.html"}
        },
        onEnter: ['dbg', function(dbg) {
          dbg.rs('account-hub.accountProfile.upgradePlan is on');
        }]
      })
      .state('account-hub.accountProfile.accountManagers', {
        url: "/account-managers",
        views: {
          'accountProfileContent': {templateUrl: prePath + "dashboard-accountProfile-accountManagers/dashboard-content.html"}
        },
        onEnter: ['dbg', function(dbg) {
          dbg.rs('account-hub.accountProfile.accountManagers is on');
        }]
      })
      .state('account-hub.accountProfile.bannerMessages', {
        url: '/banner-messages',
        views: {
          'accountProfileContent': {templateUrl: prePath + "dashboard-accountProfile-bannerMessages/dashboard-content.html"}
        },
        onEnter: ['dbg', function(dbg) {
          dbg.rs('account-hub.accountProfile.bannerMessages is on');
        }]
      })
      .state('account-hub.accountProfile.accountDatabase', {
        url: '/account-database',
        views: {
          'accountProfileContent': {templateUrl: prePath + "dashboard-accountProfile-accountDatabase/dashboard-content.html"}
        },
        onEnter: ['dbg', function(dbg) {
          dbg.rs('account-hub.accountProfile.accountDatabase is on');
        }]
      })
      .state('account-hub.accountProfile.sessionRating', {
        url: '/session-rating',
        views: {
          'accountProfileContent': {templateUrl: prePath + "dashboard-accountProfile-sessionRating/dashboard-content.html"}
        },
        onEnter: ['dbg', function(dbg) {
          dbg.rs('account-hub.accountProfile.sessionRating is on');
        }]
      })
      .state('account-hub.chatSessions', {
        url: '/chatSessions',
        onEnter: ['dbg', function (dbg) {
          dbg.rs('chatSessions');
          sessionStorage.setItem('bannerType', 'sessions');
        }],
        views: {
          'dashboardContent@account-hub': {templateUrl: prePath + "dashboard-chatSessions/dashboard-content.html"}
        }
      })
      .state('account-hub.chatSessions.builder', {
        url: '/builder/:id',
        onEnter: ['$state', 'dbg', function($state, dbg) {
          dbg.rs('chatSessions builder');
          sessionStorage.setItem('bannerType', 'sessions');
        }],
        views: {
          'dashboardContent@account-hub': {templateUrl: prePath + "dashboard-chatSessions-builder/session-builder-index.html"}
        }
      })
      .state('account-hub.resources', {
        url: "/resources",
        onEnter: ['$state', 'dbg', function($state, dbg) {
          dbg.rs('resources');
          sessionStorage.setItem('bannerType', 'resources');

          if ($state.current.name == 'account-hub.resources') $state.go('account-hub.resources.gallery');
        }],
        views: {
          'dashboardContent@account-hub': {templateUrl: prePath + "dashboard-resources/resources.html"}
        }
      })
      .state('account-hub.resources.gallery', {
        url: "/gallery",
        views: {
          'resourcesContent': {templateUrl: prePath + "dashboard-resources-gallery/dashboard-content.html"}
        },
        onEnter: ['dbg', function(dbg) {
          dbg.rs('account-hub.resources.gallery is on');
        }]
      })
      .state('account-hub.resources.contactLists', {
        url: "/contact-lists",
        views: {
          'resourcesContent': {templateUrl: prePath + "dashboard-resources-contactLists/dashboard-content.html"}
        },
        onEnter: ['dbg', function(dbg) {
          dbg.rs('account-hub.resources.contactLists is on');
        }]
      })
      .state('account-hub.resources.survey', {
        url: '/survey',
        views: {
          'resourcesContent': { templateUrl: prePath + 'dashboard-resources-contactLists-survey/dashboard-content.html' }
        },
        onEnter: ['dbg', function(dbg) {
          dbg.rs('account-hub.resources.contactLists.survey is on');
        }]
      })
      .state('account-hub.resources.topics', {
        url: "/topics",
        views: {
          'resourcesContent': {templateUrl: prePath + "dashboard-resources-topics/dashboard-content.html"}
        },
        onEnter: ['dbg', function(dbg) {
          dbg.rs('account-hub.resources.topics is on');
        }]
      })
      .state('account-hub.smsCredits', {
        url: "/smsCredits",
        views: {
          'dashboardContent@account-hub': {templateUrl: prePath + "dashboard-smsCredits/dashboard-content.html"}
        },
        onEnter: ['dbg', function(dbg) {
          dbg.rs('account-hub.smsCredits is on');
        }]
      })
      .state('account-hub.resources.emailTemplates', {
        url: "/email-templates",
        views: {
          'resourcesContent': {templateUrl: prePath + "dashboard-resources-emailTemplates/dashboard-content.html"}
        },
        onEnter: ['dbg', function(dbg) {
          dbg.rs('account-hub.resources.emailTemplates is on');
        }]
      })
      .state('account-hub.accountProfile.emailTemplates', {
        url: "/account-profile?systemMail",
        views: {
          'accountProfileContent': {templateUrl: prePath + "dashboard-resources-emailTemplates/dashboard-content.html"}
        },
        onEnter: ['dbg', function(dbg) {
          dbg.rs('account-hub.accountProfile.emailTemplates is on');
        }]
      })
      .state('account-hub.resources.brandColours', {
        url: '/brand-colours/:new?backTo&id',
        views: {
          'resourcesContent': {templateUrl: prePath + "dashboard-resources-brandColours/dashboard-content.html"}
        },
        onEnter: ['dbg', function(dbg) {
          dbg.rs('account-hub.resources.brandColours is on');
        }]
      })
  }]);
})();
