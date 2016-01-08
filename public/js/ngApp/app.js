(function () {
  'use strict';

  angular
    .module('KliikoApp', [
      // common modules
      'ngRoute',
      'oc.lazyLoad',
      'ngResource',
      'ngProgress',
      'ngMaterial',
      'ui.bootstrap',
      'ui.router',
      'globalSettings',
      'debModule',
      'domServices',
      'messenger',
      'ng-sortable',
      //'CreditCard',

      // app modules
      'KliikoApp.user',
      'KliikoApp.banners'
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

  AppController.$inject = ['$rootScope', 'dbg', 'ngProgressFactory', 'user','$q'];
  function AppController($rootScope, dbg, ngProgressFactory, user, $q ) {
    var vm = this;
    var progressbar = ngProgressFactory.createInstance();
    progressbar.start();
    dbg.log2('#AppController started ');
    progressbar.complete();

    user.getUserData().then(function(res) { vm.user = res });

  }

})();
