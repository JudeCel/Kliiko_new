(function () {
  'use strict';

  var includes = [
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
    'ngMessages',
    //'CreditCard',

    // app modules
    'KliikoApp.user',
    'KliikoApp.accountUser',
    'KliikoApp.banners',
    'KliikoApp.mailTemplate'
  ];

  angular
    .module('KliikoApp', includes)
    .config(appConfigs)
    .run(appRun)
    .controller('AppController', AppController);

  angular
    .module('KliikoApp.Root', includes)
    .config(appConfigs)
    .run(appRun)
    .controller('AppController', AppController);


  appConfigs.$inject = ['dbgProvider', '$routeProvider', '$locationProvider', '$rootScopeProvider'];
  function appConfigs(dbgProvider, $routeProvider, $locationProvider, $rootScopeProvider) {
    //$rootScopeProvider.digestTtl(20);
    dbgProvider.enable(1);
    dbgProvider.debugLevel('trace');

  }

  appRun.$inject = ['$stateParams', 'dbg', '$rootScope', '$state', 'globalSettings', 'ngProgressFactory'];
  function appRun($stateParams, dbg, $rootScope, $state, globalSettings, ngProgressFactory) {
    dbg.log('#appRun started ');
    var routerProgressbar;

    String.prototype.capitalize = function () {
      return this.charAt(0).toUpperCase() + this.slice(1);
    };

    $rootScope.appGlobals = {};

    // show and hide progress bar on state change
    $rootScope.$on('$stateChangeStart',  function(){
      routerProgressbar = ngProgressFactory.createInstance();
      routerProgressbar.start();
    });
    $rootScope.$on('$stateChangeSuccess',function(){  routerProgressbar.complete();  });

  }

  AppController.$inject = ['$rootScope', 'dbg', 'ngProgressFactory', 'user', '$q', 'accountUser'];
  function AppController($rootScope, dbg, ngProgressFactory, user, $q, accountUser) {
    var vm = this;
    var progressbar = ngProgressFactory.createInstance();
    progressbar.start();
    dbg.log2('#AppController started ');
    progressbar.complete();

    $rootScope.$on('app.updateUser', init);

    init();

    function init() {
      user.getUserData(true).then(function(res) { vm.user = res });
      accountUser.getAccountUserData(true).then(function(res) { vm.accountUser = res });
    }


  }


})();
