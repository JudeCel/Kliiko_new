(function () {
    'use strict';

    angular.module('KliikoApp').config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
        var prePath = 'js/ngApp/components/';

        // For any unmatched url, redirect to /home
        $urlRouterProvider.otherwise("/");

        $stateProvider
            .state('index', {
                abstract: true,
                url: "/",
                onEnter: ['$state', 'dbg',function($state, dbg) {
                    dbg.rs('index');
                    $state.go('dashboard');
                }]
            })

            .state('dashboard', {
                url: "",
                onEnter: ['$state', '$stateParams','dbg' ,'$location', '$rootScope' ,function($state, $stateParams,dbg, $location, $rootScope) {
                  dbg.rs('dashboard');

                    // make account profile default view on dashboard
                    setTimeout(function() {
                        if ($state.current.name == 'dashboard') $state.go('dashboard.accountProfile');
                    }, 10);
                }],
                views: {
                    'dashboard@': { templateUrl: prePath+"dashboard/dashboard.html" },
                }

        })

            .state('dashboard.accountProfile', {
                url: "/account-profile",
                views: {
                    'dashboardContent@dashboard': { templateUrl: prePath+"dashboard-accountProfile/dashboard-content.html" }
                },
                onEnter:['dbg', function( dbg) {
                    dbg.rs('dashboard.accountProfile is on');
                }]

            })

            .state('dashboard.accountProfile.upgradePlan', {
                url: "/upgrade-plan",
                views: {
                    'accountProfileContent': { templateUrl: prePath+"dashboard-accountProfile-upgradePlan/dashboard-content.html" }
                },
                onEnter:['dbg', function( dbg) {
                    dbg.rs('dashboard.accountProfile.upgradePlan is on');
                }]

            })

            .state('dashboard.accountProfile.accountManagers', {
                url: "/account-managers",
                views: {
                    'accountProfileContent': { templateUrl: prePath+"dashboard-accountProfile-accountManagers/dashboard-content.html" }
                },
                onEnter:['dbg', function( dbg) {
                    dbg.rs('dashboard.accountProfile.accountManagers is on');
                }]

            })

            ///////////////////////// Resources
            .state('dashboard.resources', {
                url: "/resources",
                onEnter: ['$state', '$stateParams','dbg' ,'$location', '$rootScope', function($state, $stateParams,dbg, $location, $rootScope) {
                    dbg.rs('resources');
                    //make account profile default view on dashboard
                    setTimeout(function() {
                        if ($state.current.name == 'dashboard.resources') $state.go('dashboard.resources.gallery');
                    }, 10);
                }],
                views: {
                    'dashboardContent@dashboard': { templateUrl: prePath+"dashboard-resources/resources.html" },
                }

            })

            .state('dashboard.resources.gallery', {
                url: "/gallery",
                views: {
                    'resourcesContent': { templateUrl: prePath+"dashboard-resources-gallery/dashboard-content.html" }
                },
                onEnter:['dbg', function( dbg) {
                    dbg.rs('dashboard.resources.gallery is on');
                }]

            })
            .state('dashboard.resources.contactList', {
                url: "/contact-list",
                views: {
                    'resourcesContent': { templateUrl: prePath+"dashboard-resources-contactList/dashboard-content.html" }
                },
                onEnter:['dbg', function( dbg) {
                    dbg.rs('dashboard.resources.contactList is on');
                }]

            })
            .state('dashboard.resources.topics', {
                url: "/topics",
                views: {
                    'resourcesContent': { templateUrl: prePath+"dashboard-resources-topics/dashboard-content.html" }
                },
                onEnter:['dbg', function( dbg) {
                    dbg.rs('dashboard.resources.topics is on');
                }]

            })
            .state('dashboard.resources.emailTemplates', {
                url: "/email-templates",
                views: {
                    'resourcesContent': { templateUrl: prePath+"dashboard-resources-emailTemplates/dashboard-content.html" }
                },
                onEnter:['dbg', function( dbg) {
                    dbg.rs('dashboard.resources.emailTemplates is on');
                }]

            })
            .state('dashboard.resources.brandColours', {
                url: "/brand-colours",
                views: {
                    'resourcesContent': { templateUrl: prePath+"dashboard-resources-brandColours/dashboard-content.html" }
                },
                onEnter:['dbg', function( dbg) {
                    dbg.rs('dashboard.resources.brandColours is on');
                }]

            })


    }]);

})();

