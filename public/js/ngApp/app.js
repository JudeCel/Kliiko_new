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

    $rootScope.$on('app.updateUser', init);

    init();

    function init() {
      user.getUserData(true).then(function(res) { vm.user = res });
    }


  }


})();

