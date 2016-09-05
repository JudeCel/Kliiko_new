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
    'toggle-switch',
    // app modules
    'KliikoApp.user',
    'KliikoApp.account',
    'KliikoApp.accountUser',
    'KliikoApp.fileUploader',
    'KliikoApp.goToChatroom',
    'KliikoApp.mailTemplate'
  ];

  angular
    .module('KliikoApp', includes)
    .factory('myInterceptor', myInterceptor)
    .config(appConfigs)
    .config(phoneNumbersConfig)
    .constant('messagesUtil', messagesUtilObject())
    .run(appRun)
    .controller('AppController', AppController);

  angular
    .module('KliikoApp.Root', includes)
    .factory('myInterceptor', myInterceptor)
    .config(appConfigs)
    .config(phoneNumbersConfig)
    .constant('messagesUtil', messagesUtilObject())
    .run(appRun)
    .controller('AppController', AppController);

  function phoneNumbersConfig(intlTelInputOptions) {
    angular.extend(intlTelInputOptions, {
      nationalMode: false,
      defaultCountry: 'au',
      preferredCountries: ['au'],
      utilsScript: '/js/vendors/intl-tel-input/src/utils.js',
      autoFormat: true,
      autoPlaceholder: true
    });
  }

  myInterceptor.$inject = ['$log','$q', '$rootScope', 'messenger'];
  function myInterceptor($log, $q, $rootScope, messenger) {
    // Show progress bar on every request

    var requestInterceptor = {
      request: function(config) {
        if(config.transformResponse.length > 0) {
          $rootScope.progressbarStart();
        }

        return config;
      },

      'response': function(response) {
        if (response.status == 404) {
          alert('that is all folks');
        }
        if(response.config.transformResponse.length > 0) {
          $rootScope.progressbarComplete();
        }
        return response;
      },

      // optional method
      'responseError': function(rejection) {
        if(rejection.status == 404) {
          messenger.error(rejection.data);
        }
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

  appRun.$inject = ['$stateParams', 'dbg', '$rootScope', '$state', 'globalSettings', 'ngProgressFactory', 'messenger'];
  function appRun($stateParams, dbg, $rootScope, $state, globalSettings, ngProgressFactory, messenger) {
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
    $rootScope.$on('$stateChangeSuccess',function(){
      $('.modal-backdrop').remove();
      messenger.clear();
      routerProgressbar.complete();
    });

    $rootScope.progressbarStart = function() {
      rootScopeProgress.start();
    };
    $rootScope.progressbarComplete = function() {
      rootScopeProgress.complete();
    }

  }

  AppController.$inject = ['$rootScope', 'dbg', 'user', '$q', 'accountUser', 'account','$cookies', '$injector', 'fileUploader', 'domServices', '$scope'];
  function AppController($rootScope, dbg, user, $q, accountUser, account, $cookies, $injector, fileUploader, domServices, $scope) {
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

    $('body').on('shown.bs.modal', function(e) {
      setFocusToFormControl(e.target);
    });

    $scope.$on('$viewContentLoaded', function() {
      setFocusToFormControl('body');
    });

    $scope.$on('$includeContentLoaded', function() {
      setFocusToFormControl('body');
    });

    $('.dashboard-header-mobile .nav a').click(function () {
      $('.navbar-collapse').collapse('hide');
      $('.modal').modal('hide');
    });

    function setFocusToFormControl(target) {
      var inputs = $(target).find('.form-control:not(.ng-autofocus-skip):visible');
      if(inputs.length) {
        inputs[0].focus();
      }
    }
  }

  function messagesUtilObject() {
    return {
      sessionBuilder: {
        noContacts: 'There are no contacts selected',
        cantSelect: "You can't select members from this list",
        noMobile: ' has no mobile provided'
      },
      gallery: {
        noResource: 'No resource selected',
        cantLoad: "Can't load resources"
      },
      contactList: {
        listNameBlank: "Contact list name can't be empty",
        noUsersRemoved: 'No users was removed',
        import: {
          failed: 'Import Failed. Check error(s)',
          corrupted: 'This file media type is not recognized or it is corrupted. Please, choose another file.',
          remapFailed: 'Field Re-Map failed',
          addCustomField: 'Please add name for your custom field.',
          tooManyCustomFields: "Too many custom fields, allowed: "
        }
      },
      upgradePlan: {
        orderCancelled: 'Order was cancelled'
      }
    }
  }
})();
