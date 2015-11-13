/**
 * Created by alex.sitdikov on 13.11.2015.
 */
'use strict';

/* App Module */

var kliiko = angular.module('Kliiko', [
    'ngRoute',
    'kliikoAnimations',
    'kliikoControllers',
    'kliikoFilters',
    'kliikoServices'
]);

kliiko.config(['$routeProvider',
    function($routeProvider) {
        $routeProvider.
            when('/dashboard', {
                templateUrl: '',
                controller: 'dashboardCtrl'
            });
    }]);