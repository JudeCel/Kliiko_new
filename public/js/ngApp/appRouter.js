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
                    //setTimeout(function() {
                    //    $state.go('dashboard.accountProfile');
                    //}, 200);
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
                    'dashboardContent@dashboard': { templateUrl: prePath+"dashboard-accountProfile-upgradePlan/dashboard-content.html" }
                },
                onEnter:['dbg', function( dbg) {
                    dbg.rs('dashboard.accountProfile.upgradePlan is on');
                }]

            })

            .state('dashboard.accountProfile.accountManagers', {
                url: "/account-managers",
                views: {
                    'dashboardContent@dashboard': { templateUrl: prePath+"dashboard-accountProfile-accountManagers/dashboard-content.html" }
                },
                onEnter:['dbg', function( dbg) {
                    dbg.rs('dashboard.accountProfile.accountManagers is on');
                }]

            })


    }]);

})();

