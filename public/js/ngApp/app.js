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
    'ngCookies',
    'colorpicker.module',
    'internationalPhoneNumber',

    // app modules
    'KliikoApp.user',
    'KliikoApp.accountUser',
    'KliikoApp.banners',
    'KliikoApp.mailTemplate'
  ];

  angular
    .module('KliikoApp', includes)
    .factory('myInterceptor', myInterceptor)



    .config(appConfigs)
    .run(appRun)
    .controller('AppController', AppController);

  angular
    .module('KliikoApp.Root', includes)
    .factory('myInterceptor', myInterceptor)
    .config(appConfigs)
    .run(appRun)
    .controller('AppController', AppController);

  myInterceptor.$inject = ['$log','$q', '$rootScope'];
  function myInterceptor($log, $q, $rootScope) {
    // Show progress bar on every request

    var requestInterceptor = {
      request: function(config) {
        $rootScope.progressbarStart();
        return config;
      },

      'response': function(response) {
        if (response.status == 404) {
          alert('that is all folks');
        }
        $rootScope.progressbarComplete();
        return response;
      },

      // optional method
      'responseError': function(rejection) {
        $rootScope.progressbarComplete();
        return $q.reject(rejection);
      }
    };

    return requestInterceptor;
  }

  appConfigs.$inject = ['dbgProvider', '$routeProvider', '$locationProvider', '$rootScopeProvider', '$httpProvider'];
  function appConfigs(dbgProvider, $routeProvider, $locationProvider, $rootScopeProvider, $httpProvider) {
    //$rootScopeProvider.digestTtl(20);
    dbgProvider.enable(1);
    dbgProvider.debugLevel('trace');

    $httpProvider.interceptors.push('myInterceptor');
  }

  appRun.$inject = ['$stateParams', 'dbg', '$rootScope', '$state', 'globalSettings', 'ngProgressFactory'];
  function appRun($stateParams, dbg, $rootScope, $state, globalSettings, ngProgressFactory) {
    dbg.log('#appRun started ');
    var routerProgressbar;
    var rootScopeProgress = ngProgressFactory.createInstance();

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

    $rootScope.progressbarStart = function() {
      rootScopeProgress.start();
    };
    $rootScope.progressbarComplete = function() {
      rootScopeProgress.complete();
    }

  }

  AppController.$inject = ['$rootScope', 'dbg', 'ngProgressFactory', 'user', '$q', 'accountUser','$cookies', '$ocLazyLoad', '$injector'];
  function AppController($rootScope, dbg, ngProgressFactory, user, $q, accountUser, $cookies, $ocLazyLoad, $injector) {
    var vm = this;
    var progressbar = ngProgressFactory.createInstance();
    progressbar.start();
    dbg.log2('#AppController started ');
    progressbar.complete();

    $rootScope.$on('app.updateUser', init);

    init();

    function init() {
      user.getUserData(true).then(function(res) {
        var phoneIsoCode = 'au';
        if(typeof res.phoneCountryData === 'string' && res.phoneCountryData.length){
          phoneIsoCode = JSON.parse(res.phoneCountryData).iso2;
        }else{
          phoneIsoCode = res.phoneCountryData.iso2;
        }
        sessionStorage.setItem('phoneCountryData',  phoneIsoCode);

        var landlineNumberIsoCode = 'au';
        if(typeof res.landlineNumberCountryData === 'string'){
          landlineNumberIsoCode = JSON.parse(res.landlineNumberCountryData).iso2;
        }else{
          landlineNumberIsoCode = res.landlineNumberCountryData.iso2;
        }
        sessionStorage.setItem('landlineNumberCountryData',  landlineNumberIsoCode);

        vm.user = res;
      });
      accountUser.getAccountUserData(true).then(function(res) { vm.accountUser = res });

      checkForInvite();

      function checkForInvite() {
        var sessionServices;
        var inviteToken = $cookies.get('inviteAccepted');
        if (!inviteToken) return;
        $cookies.remove('inviteAccepted');
        $ocLazyLoad.load(['/js/ngApp/modules/topicsAndSessions/topicsAndSessions.js']).then(function() {
          sessionServices = $injector.get('topicsAndSessions');

          sessionServices.getSessionByInvite(inviteToken).then(function(res) {
            if (res.error) {
              alert(res.error);
            }
          },
          function (err) {
            alert(err);
          });

        });


      }

    }


  }


})();
