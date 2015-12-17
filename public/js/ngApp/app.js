(function () {
  'use strict';

  angular
    .module('KliikoApp', [
      // common modules
      'ngRoute',
      'ngResource',
      'ngMaterial',
      'ui.bootstrap',
      'ui.router',
      'globalSettings',
      'debModule',
      'domServices',
      'CreditCard',


      // app modules
      'KliikoApp.user'
    ])
    .config(appConfigs)
    .run(appRun)
    .controller('AppController', AppController);


  appConfigs.$inject = ['dbgProvider', '$routeProvider', '$locationProvider', '$rootScopeProvider'];
  function appConfigs(dbgProvider, $routeProvider, $locationProvider, $rootScopeProvider) {
    //$rootScopeProvider.digestTtl(20);
    dbgProvider.enable(1);
    dbgProvider.debugLevel('trace');

  }

  appRun.$inject = ['$stateParams', 'dbg', '$rootScope', '$state', 'globalSettings'];
  function appRun($stateParams, dbg, $rootScope, $state, globalSettings) {
    dbg.log('#appRun started ');

    String.prototype.capitalize = function () {
      return this.charAt(0).toUpperCase() + this.slice(1);
    };

    $rootScope.appGlobals = {};

  }

  AppController.$inject = ['$rootScope', 'dbg', '$scope', '$mdDialog', '$mdMedia'];
  function AppController($rootScope, dbg, $scope, $mdDialog, $mdMedia) {
    var vm = this;

    dbg.log2('#AppController started ');

  }


})();

