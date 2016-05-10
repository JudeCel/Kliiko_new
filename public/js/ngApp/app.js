(function () {
  'use strict';

  var includes = [
    // common modules
    'ngRoute',
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
    'betsol.intlTelInput',
    'ngDraggable',
    'contactList',
    'topicsAndSessions',
    'ngFileUpload',
    'ui.sortable',
    'angularUtils.directives.dirPagination',

    // app modules
    'KliikoApp.user',
    'KliikoApp.account',
    'KliikoApp.accountUser',
    'KliikoApp.fileUploader',
    'KliikoApp.mailTemplate'
  ];

  angular
    .module('KliikoApp', includes)
    .factory('myInterceptor', myInterceptor)
    .config(appConfigs)
    .config(phoneNumbersConfig)
    .run(appRun)
    .controller('AppController', AppController);

  angular
    .module('KliikoApp.Root', includes)
    .factory('myInterceptor', myInterceptor)
    .config(appConfigs)
    .config(phoneNumbersConfig)
    .run(appRun)
    .controller('AppController', AppController);

  function phoneNumbersConfig(intlTelInputOptions) {
    angular.extend(intlTelInputOptions, {
      nationalMode: false,
      defaultCountry: 'au',
      preferredCountries: ['au'],
      utilsScript: 'js/vendors/intl-tel-input/src/utils.js',
      autoFormat: true,
      autoPlaceholder: true
    });
  }

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
    if (!$httpProvider.defaults.headers.get) {
        $httpProvider.defaults.headers.get = {};
    }

    $httpProvider.defaults.headers.get['Cache-Control'] = 'no-cache';
    $httpProvider.defaults.headers.get['Pragma'] = 'no-cache';
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

  AppController.$inject = ['$rootScope', 'dbg', 'user', '$q', 'accountUser', 'account','$cookies', '$injector', 'fileUploader', 'domServices'];
  function AppController($rootScope, dbg, user, $q, accountUser, account, $cookies, $injector, fileUploader, domServices) {
    var vm = this;
    vm.openContactDetailsModal = openContactDetailsModal;
    dbg.log2('#AppController started ');
    $rootScope.$on('app.updateUser', init);

    init();

    function init() {
      user.getUserData(vm).then(function(res) {
        setSessionStorage(res);
        vm.user = res;
      });
      accountUser.getAccountUserData().then(function(res) { vm.accountUser = res });
      account.getAccountData().then(function(res) { vm.account = res });
      fileUploader.getToken().then(function(res) { vm.fileUploader = res });
    }

    function openContactDetailsModal() {
      setTimeout(function () {
        domServices.modal('contactDetailsModal');
      }, 10);
    }

    function setSessionStorage(res) {
      if(res.phoneCountryData) {
        var phoneIsoCode = 'au';
        if(typeof res.phoneCountryData === 'string' && res.phoneCountryData.length){
          phoneIsoCode = JSON.parse(res.phoneCountryData).iso2;
        }else{
          phoneIsoCode = res.phoneCountryData.iso2;
        }
        sessionStorage.setItem('phoneCountryData',  phoneIsoCode);
      }

      if(res.landlineNumberCountryData) {
        var landlineNumberIsoCode = 'au';
        if(typeof res.landlineNumberCountryData === 'string'){
          landlineNumberIsoCode = JSON.parse(res.landlineNumberCountryData).iso2;
        }else{
          landlineNumberIsoCode = res.landlineNumberCountryData.iso2;
        }
        sessionStorage.setItem('landlineNumberCountryData',  landlineNumberIsoCode);
      }
    }
  }
})();
